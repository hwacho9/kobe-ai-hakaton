import { Plus } from "lucide-react";

export default function AddSavingButton() {
    return (
        <button className="fixed bottom-20 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-full w-24 h-12 flex items-center justify-center shadow-lg">
            <Plus className="h-6 w-6" />
        </button>
    );
}
