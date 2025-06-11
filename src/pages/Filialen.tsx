
import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { FilialeFormFields } from "@/components/filialen/FilialeFormFields";
import { FilialeTable } from "@/components/filialen/FilialeTable";
import { FilialeActions } from "@/components/filialen/FilialeActions";
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

  if (isLoading) {
    return (
      <AppLayout title="Filialen" subtitle="Filialen und Standorte verwalten">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p>Lade Filialen...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Filialen" subtitle="Filialen und Standorte verwalten">
      <FilialeActions 
        filialeCount={Array.isArray(filialen) ? filialen.length : 0}
        onAddFiliale={() => setIsAddDialogOpen(true)}
      />

      <Card className="mt-6">
        <CardContent className="pt-6">
          <FilialeTable
            filialen={Array.isArray(filialen) ? filialen : []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Add Filiale Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                users={Array.isArray(users) ? users : []}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Filiale erstellen</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                users={Array.isArray(users) ? users : []}
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
