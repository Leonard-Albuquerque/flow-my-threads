import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Product } from "@/types";
import { Plus, Trash2 } from "lucide-react";

interface ProductSale {
  productId: string;
  quantity: number;
  sellingPrice: number;
}

interface MultipleProductSaleFormProps {
  onSellMultipleProducts: (productSales: ProductSale[]) => void;
  products: Product[];
}

export const MultipleProductSaleForm = ({
  onSellMultipleProducts,
  products,
}: MultipleProductSaleFormProps) => {
  const [productSales, setProductSales] = useState<ProductSale[]>([
    { productId: "", quantity: 1, sellingPrice: 0 },
  ]);

  const addProductSale = () => {
    setProductSales([
      ...productSales,
      { productId: "", quantity: 1, sellingPrice: 0 },
    ]);
  };

  const removeProductSale = (index: number) => {
    if (productSales.length > 1) {
      setProductSales(productSales.filter((_, i) => i !== index));
    }
  };

  const updateProductSale = (
    index: number,
    field: keyof ProductSale,
    value: string | number,
  ) => {
    const updated = [...productSales];
    updated[index] = { ...updated[index], [field]: value };
    setProductSales(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      productSales.some(
        (sale) => !sale.productId || !sale.quantity || !sale.sellingPrice,
      )
    ) {
      toast.error("Preencha todos os campos para todos os produtos");
      return;
    }

    // Check for duplicate products
    const productIds = productSales.map((s) => s.productId);
    if (new Set(productIds).size !== productIds.length) {
      toast.error(
        "Não é possível vender o mesmo produto múltiplas vezes na mesma transação",
      );
      return;
    }

    onSellMultipleProducts(productSales);
    setProductSales([{ productId: "", quantity: 1, sellingPrice: 0 }]);
    toast.success("Venda múltipla registrada com sucesso!");
  };

  const totalAmount = productSales.reduce(
    (sum, sale) => sum + sale.quantity * sale.sellingPrice,
    0,
  );

  const totalProfit = productSales.reduce((sum, sale) => {
    if (!sale.productId || !sale.sellingPrice) return sum;
    const product = products.find((p) => p.id === sale.productId);
    if (!product) return sum;
    return (
      sum +
      (sale.sellingPrice - parseFloat(product.costPrice.toString())) *
        sale.quantity
    );
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venda Múltipla de Produtos</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {productSales.map((sale, index) => (
            <div key={index} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Produto {index + 1}</h4>
                {productSales.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeProductSale(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label htmlFor={`product-${index}`}>Produto</Label>
                  <Select
                    value={sale.productId}
                    onValueChange={(value) =>
                      updateProductSale(index, "productId", value)
                    }
                  >
                    <SelectTrigger id={`product-${index}`}>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products
                        .filter((product) => product.quantity !== 0)
                        .map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name +
                              "   " +
                              product.color +
                              "   " +
                              product.size}{" "}
                            (Estoque: {product.quantity}) - Custo: R${" "}
                            {parseFloat(product.costPrice.toString()).toFixed(
                              2,
                            )}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`quantity-${index}`}>Quantidade</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={sale.quantity}
                      onChange={(e) =>
                        updateProductSale(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 1,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`price-${index}`}>
                      Preço de Venda (R$)
                    </Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={sale.sellingPrice || ""}
                      onChange={(e) =>
                        updateProductSale(
                          index,
                          "sellingPrice",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                </div>

                {sale.productId && sale.sellingPrice > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Lucro: R${" "}
                    {(() => {
                      const product = products.find(
                        (p) => p.id === sale.productId,
                      );
                      if (!product) return "0,00";
                      const profit =
                        (sale.sellingPrice -
                          parseFloat(product.costPrice.toString())) *
                        sale.quantity;
                      return profit.toFixed(2).replace(".", ",");
                    })()}
                  </div>
                )}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addProductSale}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Total:</span>
              <span className="text-lg font-bold text-success">
                R$ {totalAmount.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Lucro Total:</span>
              <span className="text-lg font-bold text-blue-600">
                R$ {totalProfit.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <Button type="submit" className="w-full">
              Registrar Venda Múltipla
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
