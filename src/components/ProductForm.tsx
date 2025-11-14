import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Product } from "@/types";

interface ProductFormProps {
  onAddProduct: (product: Omit<Product, "id">) => void;
}

export const ProductForm = ({ onAddProduct }: ProductFormProps) => {
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [colorNotApplicable, setColorNotApplicable] = useState(false);
  const [sizeNotApplicable, setSizeNotApplicable] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !costPrice || !quantity) {
      toast.error("Preencha todos os campos");
      return;
    }

    const product: Omit<Product, "id"> = {
      name,
      costPrice: parseFloat(costPrice),
      quantity: parseInt(quantity),
      ...(colorNotApplicable ? {} : { color: color.trim() || undefined }),
      ...(sizeNotApplicable ? {} : { size: size.trim() || undefined }),
    };

    onAddProduct(product);

    // Reset form
    setName("");
    setCostPrice("");
    setQuantity("");
    setColor("");
    setSize("");
    setColorNotApplicable(false);
    setSizeNotApplicable(false);

    toast.success("Produto adicionado com sucesso!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Produto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Nome do Produto</Label>
            <Input
              id="product-name"
              placeholder="Ex: Camiseta Básica"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost-price">Preço de Custo (R$)</Label>
            <Input
              id="cost-price"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Cor</Label>
            <Input
              id="color"
              placeholder="Ex: Azul"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              disabled={colorNotApplicable}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="color-not-applicable"
                checked={colorNotApplicable}
                onCheckedChange={(checked) => setColorNotApplicable(!!checked)}
              />
              <Label htmlFor="color-not-applicable" className="text-sm">
                Cor não aplicável
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="size">Tamanho</Label>
            <Input
              id="size"
              placeholder="Ex: M"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              disabled={sizeNotApplicable}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="size-not-applicable"
                checked={sizeNotApplicable}
                onCheckedChange={(checked) => setSizeNotApplicable(!!checked)}
              />
              <Label htmlFor="size-not-applicable" className="text-sm">
                Tamanho não aplicável
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Adicionar Produto
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
