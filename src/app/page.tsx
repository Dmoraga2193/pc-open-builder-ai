"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import * as XLSX from "xlsx";

interface Setup {
  id: string;
  components: string[];
  performance: string;
}

export default function Home() {
  const [userNeeds, setUserNeeds] = useState("");
  const [budget, setBudget] = useState("");
  const [setups, setSetups] = useState<Setup[]>([]);
  const [savedSetups, setSavedSetups] = useState<Setup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [compareSetups, setCompareSetups] = useState<Setup[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("savedSetups");
    if (saved) {
      setSavedSetups(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post("/api/generate-setups", {
        userNeeds,
        budget,
      });
      const newSetups = response.data.map((setup: Setup) => ({
        ...setup,
        id: Date.now() + Math.random().toString(36).substr(2, 9),
      }));
      setSetups(newSetups);
    } catch (error) {
      console.error("Error generating setups:", error);
    }
    setIsLoading(false);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    setups.forEach((setup, index) => {
      const wsData = [
        ["Componentes", "Rendimiento"],
        ...setup.components.map((component) => [component]),
        ["", ""],
        ["Rendimiento Aproximado", setup.performance],
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, `Setup ${index + 1}`);
    });
    XLSX.writeFile(wb, "PC_Setups.xlsx");
  };

  const saveSetup = (setup: Setup) => {
    const newSavedSetups = [...savedSetups, setup];
    setSavedSetups(newSavedSetups);
    localStorage.setItem("savedSetups", JSON.stringify(newSavedSetups));
  };

  const removeSetup = (id: string) => {
    const newSavedSetups = savedSetups.filter((setup) => setup.id !== id);
    setSavedSetups(newSavedSetups);
    localStorage.setItem("savedSetups", JSON.stringify(newSavedSetups));
  };

  const addToCompare = (setup: Setup) => {
    if (compareSetups.length < 2) {
      setCompareSetups([...compareSetups, setup]);
    }
  };

  const removeFromCompare = (id: string) => {
    setCompareSetups(compareSetups.filter((setup) => setup.id !== id));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Generador de Setups de PC</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label
            htmlFor="userNeeds"
            className="block text-sm font-medium text-gray-700"
          >
            Describe tus necesidades:
          </label>
          <Textarea
            id="userNeeds"
            value={userNeeds}
            onChange={(e) => setUserNeeds(e.target.value)}
            className="mt-1"
            rows={4}
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="budget"
            className="block text-sm font-medium text-gray-700"
          >
            Presupuesto (opcional):
          </label>
          <Input
            id="budget"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="mt-1"
            placeholder="Ingresa tu presupuesto"
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Generando..." : "Generar Setups"}
        </Button>
      </form>

      <Tabs defaultValue="generated" className="mb-8">
        <TabsList>
          <TabsTrigger value="generated">Setups Generados</TabsTrigger>
          <TabsTrigger value="saved">Setups Guardados</TabsTrigger>
          <TabsTrigger value="compare">Comparar Setups</TabsTrigger>
        </TabsList>
        <TabsContent value="generated">
          {setups.length > 0 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {setups.map((setup) => (
                  <Card key={setup.id}>
                    <CardHeader>
                      <CardTitle>Setup</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 mb-2">
                        {setup.components.map((component, compIndex) => (
                          <li key={compIndex}>{component}</li>
                        ))}
                      </ul>
                      <p className="font-semibold">
                        Rendimiento: {setup.performance}
                      </p>
                      <div className="mt-4 space-x-2">
                        <Button onClick={() => saveSetup(setup)}>
                          Guardar
                        </Button>
                        <Button onClick={() => addToCompare(setup)}>
                          Comparar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button onClick={exportToExcel}>Exportar a Excel</Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="saved">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savedSetups.map((setup) => (
              <Card key={setup.id}>
                <CardHeader>
                  <CardTitle>Setup Guardado</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 mb-2">
                    {setup.components.map((component, compIndex) => (
                      <li key={compIndex}>{component}</li>
                    ))}
                  </ul>
                  <p className="font-semibold">
                    Rendimiento: {setup.performance}
                  </p>
                  <div className="mt-4 space-x-2">
                    <Button onClick={() => removeSetup(setup.id)}>
                      Eliminar
                    </Button>
                    <Button onClick={() => addToCompare(setup)}>
                      Comparar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="compare">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {compareSetups.map((setup) => (
              <Card key={setup.id}>
                <CardHeader>
                  <CardTitle>Setup Comparado</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 mb-2">
                    {setup.components.map((component, compIndex) => (
                      <li key={compIndex}>{component}</li>
                    ))}
                  </ul>
                  <p className="font-semibold">
                    Rendimiento: {setup.performance}
                  </p>
                  <Button
                    onClick={() => removeFromCompare(setup.id)}
                    className="mt-4"
                  >
                    Quitar de comparación
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
