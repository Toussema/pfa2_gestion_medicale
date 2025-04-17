export interface Document {
    id: number;
    rendezVous: { id: number };
    sender: { id: number; name: string };
    fileName: string;
    fileType: string;
    uploadDate: string;
    isConsulted: boolean;
    remarks: string | null;
  }