
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { FilialeFormFields } from "@/components/filialen/FilialeFormFields";
import { FilialeTable } from "@/components/filialen/FilialeTable";
import { useFilialen } from "@/hooks/useFilialen";

const Filialen = () => {
  const {
    filialen,
    users,
    isLoading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    activeFiliale,
    formData,
    setFormData,
    handleAddFiliale,
    handleUpdateFiliale,
    handleEdit,
    handleDelete
  } = useFilialen();

  return (
    <AppLayout title="Filialen" subtitle="Filialen und Standorte verwalten">
      <div className="admin-controls flex justify-between items-center">
        <div>
          <span className="text-sm font-medium">Filialen gesamt: {filialen.length}</span>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle size={16} />
              <span>Neue Filiale</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle>Neue Filiale erstellen</DialogTitle>
              <DialogDescription>
                Geben Sie die Informationen für die neue Filiale ein.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddFiliale}>
              <div className="grid gap-4 py-4">
                <FilialeFormFields
                  formData={formData}
                  setFormData={setFormData}
                  users={users}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Filiale erstellen</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <FilialeTable
            filialen={filialen}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Edit Filiale Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>Filiale bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie die Informationen für {activeFiliale?.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateFiliale}>
            <div className="grid gap-4 py-4">
              <FilialeFormFields
                formData={formData}
                setFormData={setFormData}
                users={users}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Änderungen speichern</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Filialen;
