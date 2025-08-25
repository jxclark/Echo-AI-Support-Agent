import { atom } from "jotai";
import { WidgetScreen } from "../types";

// Bsaic widget state atoms
export const screenAtom = atom<WidgetScreen>("auth");
