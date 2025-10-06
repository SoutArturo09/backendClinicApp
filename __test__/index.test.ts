import request from "supertest";
import app from "../index"; 
import * as service from "../services/medic.service";
import db from "../config/db";

// Mockeamos las funciones de servicio
jest.mock("../services/medic.service");
jest.mock("../config/db");

// Mock de Supabase
jest.mock('../config/supabase', () => ({
  __esModule: true,
  default: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      admin: {
        generateLink: jest.fn()
      }
    }
  }
}));

describe("🏥 Clinic App - Pruebas Unitarias Completas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("📋 Pruebas de Inserción y Consulta de Datos", () => {
    it("✅ Inserta un médico correctamente con todos los campos", async () => {
      const mockMedic = {
        id: 1,
        nombre: "Dr. Ariel González",
      };

      (service.postMedic as jest.Mock).mockResolvedValue(mockMedic);

      const res = await request(app)
        .post("/api/medic/post")
        .send({
          nombre: "Dr. Ariel González",
        });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockMedic);
      expect(service.postMedic).toHaveBeenCalledWith({
        nombre: "Dr. Ariel González",
      });
    });

    it("❌ Rechaza inserción sin nombre", async () => {
      const res = await request(app)
        .post("/api/medic/post")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("required");
    });

    it("❌ Rechaza inserción con datos inválidos", async () => {
      const res = await request(app)
        .post("/api/medic/post")
        .send({
          nombre: "Dr", // Muy corto
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("3");
    });

    it("✅ Obtiene lista completa de médicos", async () => {
      const mockMedics = [
        { id: 1, nombre: "Dr. Juan Pérez" },
        { id: 2, nombre: "Dra. María García" },
      ];

      (service.getMedic as jest.Mock).mockResolvedValue(mockMedics);

      const res = await request(app).get("/api/medic/get");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockMedics);
      expect(res.body).toHaveLength(2);
    });

    it("✅ Obtiene lista vacía cuando no hay médicos", async () => {
      (service.getMedic as jest.Mock).mockResolvedValue([]);

      const res = await request(app).get("/api/medic/get");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
      expect(res.body).toHaveLength(0);
    });
  });

  describe("☁️ Pruebas de Manejo de Errores Cloud", () => {
    
    test("🔥 Simula error de conexión a Supabase", async () => {
      (service.getMedic as jest.Mock).mockRejectedValue(
        new Error("Connection timeout to Supabase")
      );

      const res = await request(app)
        .get("/api/medic/get");

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toContain("Connection timeout");
    });

    test("🔥 Simula error de inserción en base de datos", async () => {
      (service.postMedic as jest.Mock).mockRejectedValue(
        new Error("Database constraint violation")
      );

      const res = await request(app)
        .post("/api/medic/post")
        .send({ nombre: "Dr. Test" });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toContain("Database constraint violation");
    });

    test("🔥 Simula timeout en operación de consulta", async () => {
      (service.getMedic as jest.Mock).mockRejectedValue(
        new Error("Request timeout after 30s")
      );

      const res = await request(app)
        .get("/api/medic/get");

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error");
    });

    test("🔥 Simula error de red intermitente", async () => {
      (service.postMedic as jest.Mock).mockRejectedValue(
        new Error("Network error: ECONNRESET")
      );

      const res = await request(app)
        .post("/api/medic/post")
        .send({ nombre: "Dr. Network Test" });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error");
    });

    test("🔥 Simula error de límite de rate en API", async () => {
      (service.getMedic as jest.Mock).mockRejectedValue(
        new Error("Rate limit exceeded. Try again later")
      );

      const res = await request(app)
        .get("/api/medic/get");

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });



  describe("🔑 Pruebas de Autenticación de Usuarios", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("✅ Registra un usuario exitosamente", async () => {
      const mockSupabase = require('../config/supabase').default;
      
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com'
          }
        },
        error: null
      });

      mockSupabase.auth.admin.generateLink.mockResolvedValue({
        data: { link: 'magic-link' },
        error: null
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.email).toBe("test@example.com");
    });

    it("❌ Rechaza registro con email duplicado", async () => {
      const mockSupabase = require('../config/supabase').default;
      
      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' }
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "existing@example.com",
          password: "password123",
        });

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe("User already registered");
    });

    it("❌ Rechaza registro con email inválido", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "invalid-email",
          password: "password123",
        });

      expect(res.status).toBe(400);
      expect(res.body.msg).toContain("email");
    });

    it("❌ Rechaza registro con contraseña muy corta", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          password: "123",
        });

      expect(res.status).toBe(400);
      expect(res.body.msg).toContain("6");
    });

    it("✅ Login exitoso con credenciales válidas", async () => {
      const mockSupabase = require('../config/supabase').default;
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com'
          },
          session: {
            access_token: 'valid-token'
          }
        },
        error: null
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.email).toBe("test@example.com");
    });

    it("❌ Rechaza login con credenciales incorrectas", async () => {
      const mockSupabase = require('../config/supabase').default;
      
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' }
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          password: "wrongpassword",
        });

      expect(res.status).toBe(400);
      expect(res.body.msg).toBe("Invalid login credentials");
    });
  });

  describe("🔍 Pruebas de Integración de Servicios", () => {
    it("✅ Flujo completo: registro → acceso a recursos", async () => {
      const mockSupabase = require('../config/supabase').default;
      
      // Mock registro exitoso
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: 'user123',
            email: 'integration@example.com'
          }
        },
        error: null
      });

      mockSupabase.auth.admin.generateLink.mockResolvedValue({
        data: { link: 'magic-link' },
        error: null
      });

      const registerRes = await request(app)
        .post("/api/auth/register")
        .send({
          email: "integration@example.com",
          password: "password123",
        });

      expect(registerRes.status).toBe(201);
      
      // Acceso a recurso después del registro
      (service.getMedic as jest.Mock).mockResolvedValue([]);
      const resourceRes = await request(app).get("/api/medic/get");
      expect(resourceRes.status).toBe(200);
    });

    it("🔄 Prueba de resistencia: reintento después de error temporal", async () => {
      // Primer intento falla
      (service.getMedic as jest.Mock).mockRejectedValueOnce(
        new Error("Temporary network error")
      );
      
      // Segundo intento exitoso
      (service.getMedic as jest.Mock).mockResolvedValueOnce([
        { id: 1, nombre: "Dr. Resiliente" }
      ]);

      const firstRes = await request(app).get("/api/medic/get");
      expect(firstRes.status).toBe(500);

      const secondRes = await request(app).get("/api/medic/get");
      expect(secondRes.status).toBe(200);
      expect(secondRes.body.length).toBe(1);
    });

    test("✅ Validación de datos en múltiples operaciones", async () => {
      // Insertar médico válido
      (service.postMedic as jest.Mock).mockResolvedValue({ 
        id: 1, 
        nombre: "Dr. Test" 
      });

      const insertRes = await request(app)
        .post("/api/medic/post")
        .send({ nombre: "Dr. Test" });

      expect(insertRes.status).toBe(201);

      // Consultar médicos
      (service.getMedic as jest.Mock).mockResolvedValue([
        { id: 1, nombre: "Dr. Test" }
      ]);

      const getRes = await request(app)
        .get("/api/medic/get");

      expect(getRes.status).toBe(200);
      expect(getRes.body).toHaveLength(1);
    });
  });
});
