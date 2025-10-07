import supabase from "../config/supabase";
import {Medic} from "../models/medicModel";



export async function getMedic() {
    try {
        const { data, error } = await supabase
        .from('medicos')
        .select('*')
        if (error) throw new Error(error.message);
        return data;
    } catch (error) {
        console.log(error)
    }
}

export async function postMedic(medic: Medic) {
    try {
        const { data, error } = await supabase
        .from('medicos')
        .insert(medic)
        if (error) throw new Error(error.message);
        return data;
    } catch (error) {
        console.log(error)
    }
};
