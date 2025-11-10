import { useState } from "react";
import { ProductForm } from "@/components/ProductForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Package, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts } from "@/contexts/ProductContext";

const Products = () => {
  const { products, addProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gerenciar Produtos</h1>
                <p className="text-sm text-muted-foreground">Adicione e gerencie seus produtos</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Add Product Form */}
          <div>
            <ProductForm onAddProduct={addProduct} />
          </div>

          {/* Product List with Search */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Buscar Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Buscar por nome</Label>
                    <Input
                      id="search"
                      placeholder="Digite o nome do produto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produtos ({filteredProducts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredProducts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    {searchTerm ? "Nenhum produto encontrado." : "Nenhum produto cadastrado ainda."}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Custo: R$ {product.costPrice.toFixed(2)}
                          </p>
                          {product.color && (
                            <p className="text-sm text-muted-foreground">
                              Cor: {product.color}
                            </p>
                          )}
                          {product.size && (
                            <p className="text-sm text-muted-foreground">
                              Tamanho: {product.size}
                            </p>
                          )}
                        </div>
                        <Badge variant={product.quantity > 0 ? "default" : "destructive"}>
                          {product.quantity} em estoque
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;
