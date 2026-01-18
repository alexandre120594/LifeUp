import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DialogFormsProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  dialogContent: React.ReactNode;
  dialogTitle: string;
  // Adicionamos a prop trigger para passar qualquer botão
  trigger: React.ReactNode; 
}

function DialogForms({ 
  isOpen, 
  setIsOpen, 
  dialogContent, 
  dialogTitle, 
  trigger 
}: DialogFormsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        {dialogContent}
      </DialogContent>
    </Dialog>
  );
}

export default DialogForms;