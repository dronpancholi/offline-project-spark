
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Category } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [newCategory, setNewCategory] = useState<Omit<Category, 'id'>>({ name: '', color: '#9B87F5' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Color options for category
  const colorOptions = [
    '#FF5A5A', // Red
    '#FFBD59', // Orange
    '#FFDF5A', // Yellow
    '#5AFF5A', // Green
    '#59B0FF', // Blue
    '#9B87F5', // Purple
    '#FF5AE8', // Pink
    '#5AFFFF', // Cyan
    '#7D7D7D'  // Gray
  ];
  
  // Handle adding a new category
  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      addCategory({
        name: newCategory.name.trim(),
        color: newCategory.color
      });
      setNewCategory({ name: '', color: '#9B87F5' });
      setIsAdding(false);
    }
  };
  
  // Handle updating a category
  const handleUpdateCategory = () => {
    if (editingCategory && editingCategory.name.trim()) {
      updateCategory(editingCategory);
      setEditingCategory(null);
    }
  };
  
  // Handle deleting a category
  const handleDeleteCategory = (category: Category) => {
    deleteCategory(category.id);
  };
  
  return (
    <div className="space-y-6">
      {/* Category list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(category => (
          <Card key={category.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color || '#7D7D7D' }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setEditingCategory(category)}
                    disabled={editingCategory !== null}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{category.name}"? This action cannot be undone.
                          Tasks using this category will need to be reassigned.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(category)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Add new category */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>
            Create custom categories to better organize your tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAdding ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  placeholder="Enter category name"
                  value={newCategory.name}
                  onChange={e => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Category Color</Label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((color, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-8 rounded-full cursor-pointer",
                        newCategory.color === color ? "ring-2 ring-primary scale-105" : ""
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAdding(false);
                    setNewCategory({ name: '', color: '#9B87F5' });
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddCategory}
                  disabled={!newCategory.name.trim()}
                >
                  Add Category
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              onClick={() => setIsAdding(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Category
            </Button>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Category Dialog */}
      {editingCategory && (
        <AlertDialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Category</AlertDialogTitle>
            </AlertDialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category-name">Category Name</Label>
                <Input
                  id="edit-category-name"
                  value={editingCategory.name}
                  onChange={e => setEditingCategory(prev => 
                    prev ? { ...prev, name: e.target.value } : null
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Category Color</Label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((color, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-8 rounded-full cursor-pointer",
                        editingCategory.color === color ? "ring-2 ring-primary scale-105" : ""
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingCategory(prev => 
                        prev ? { ...prev, color } : null
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUpdateCategory}
                disabled={!editingCategory.name.trim()}
              >
                Save Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
