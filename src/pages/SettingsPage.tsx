
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useApp } from '@/contexts/AppContext';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from '@/components/ui/accordion';
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
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CategoryManager } from '@/components/settings/CategoryManager';
import { CheckCircle, Download, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const { settings, updateSettings, resetAllData, exportData, importData } = useApp();
  const { toast } = useToast();
  
  const [localSettings, setLocalSettings] = useState({
    darkMode: settings.darkMode,
    enableReminders: settings.enableReminders,
    theme: settings.theme || 'light',
    notificationTimes: settings.notificationTimes || [5, 30, 60, 1440]
  });
  
  const handleToggleDarkMode = () => {
    const newSettings = {
      ...settings,
      darkMode: !localSettings.darkMode,
    };
    setLocalSettings(prevSettings => ({ ...prevSettings, darkMode: !prevSettings.darkMode }));
    updateSettings(newSettings);
  };
  
  const handleToggleReminders = () => {
    const newSettings = {
      ...settings,
      enableReminders: !localSettings.enableReminders,
    };
    setLocalSettings(prevSettings => ({ ...prevSettings, enableReminders: !prevSettings.enableReminders }));
    updateSettings(newSettings);
  };
  
  const handleThemeChange = (value: 'light' | 'dark' | 'auto') => {
    const newSettings = {
      ...settings,
      theme: value
    };
    setLocalSettings(prevSettings => ({ ...prevSettings, theme: value }));
    updateSettings(newSettings);
  };
  
  // Handle export data
  const handleExportData = async () => {
    try {
      const jsonData = await exportData();
      
      // Create download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Setup and trigger download
      link.href = url;
      link.download = `first-projects-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Your data has been exported successfully."
      });
    } catch (error) {
      console.error('Export failed', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive"
      });
    }
  };
  
  // Handle import data
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = e.target?.result as string;
        await importData(jsonData);
        
        toast({
          title: "Import Successful",
          description: "Your data has been imported successfully."
        });
      } catch (error) {
        console.error('Import failed', error);
        toast({
          title: "Import Failed",
          description: "There was an error importing your data. The file might be corrupted.",
          variant: "destructive"
        });
      }
      
      // Reset the file input
      event.target.value = '';
    };
    
    reader.readAsText(file);
  };
  
  return (
    <AppLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        
        {/* Settings sections */}
        <div className="space-y-6">
          {/* Profile Settings */}
          <Accordion type="single" collapsible defaultValue="profile" className="w-full">
            <AccordionItem value="profile">
              <AccordionTrigger className="text-lg">Edit Profile</AccordionTrigger>
              <AccordionContent>
                <div className="py-4">
                  <ProfileForm />
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* Categories Manager */}
            <AccordionItem value="categories">
              <AccordionTrigger className="text-lg">Manage Categories</AccordionTrigger>
              <AccordionContent>
                <div className="py-4">
                  <CategoryManager />
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* App Preferences */}
            <AccordionItem value="preferences">
              <AccordionTrigger className="text-lg">App Preferences</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    {/* Theme Selection */}
                    <div className="space-y-3">
                      <Label>Theme</Label>
                      <RadioGroup 
                        value={localSettings.theme} 
                        onValueChange={value => handleThemeChange(value as 'light' | 'dark' | 'auto')}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="light" id="theme-light" />
                          <Label htmlFor="theme-light">Light</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dark" id="theme-dark" />
                          <Label htmlFor="theme-dark">Dark</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="auto" id="theme-auto" />
                          <Label htmlFor="theme-auto">Auto (follow system)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <Separator />
                    
                    {/* Dark Mode Toggle (legacy) */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Switch between light and dark theme
                        </p>
                      </div>
                      <Switch
                        id="dark-mode"
                        checked={localSettings.darkMode}
                        onCheckedChange={handleToggleDarkMode}
                      />
                    </div>
                    
                    <Separator />
                    
                    {/* Reminders Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="reminders">Task Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about upcoming tasks
                        </p>
                      </div>
                      <Switch
                        id="reminders"
                        checked={localSettings.enableReminders}
                        onCheckedChange={handleToggleReminders}
                      />
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
            
            {/* Data Management */}
            <AccordionItem value="data">
              <AccordionTrigger className="text-lg">Data Management</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {/* Export Data */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Export Your Data</CardTitle>
                      <CardDescription>
                        Download a backup of all your tasks, profile, and settings
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button onClick={handleExportData} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Export to JSON
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Import Data */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Import Data</CardTitle>
                      <CardDescription>
                        Restore your data from a previous backup file
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <div className="w-full">
                        <Label htmlFor="import-file" className="cursor-pointer">
                          <div className="flex items-center justify-center w-full p-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors">
                            <Upload className="mr-2 h-4 w-4" />
                            Select Backup File
                          </div>
                          <input
                            id="import-file"
                            type="file"
                            accept=".json"
                            onChange={handleImportData}
                            className="hidden"
                          />
                        </Label>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          Only import files exported from First Projects
                        </p>
                      </div>
                    </CardFooter>
                  </Card>
                  
                  {/* Reset All Data */}
                  <Card className="border-destructive">
                    <CardHeader>
                      <CardTitle className="text-destructive">Reset All Data</CardTitle>
                      <CardDescription>
                        This will reset the app and delete all your data. This cannot be undone.
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full">Reset All Data</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will permanently delete all your tasks, progress, and profile data.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={resetAllData}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Reset Everything
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            {/* About */}
            <AccordionItem value="about">
              <AccordionTrigger className="text-lg">About First Projects</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4 text-center">
                      <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto">
                        <span className="text-xl text-primary-foreground font-bold">FP</span>
                      </div>
                      
                      <div>
                        <h3 className="font-bold">First Projects v2.0</h3>
                        <p className="text-sm text-muted-foreground">
                          A beautiful offline task manager
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <p className="text-sm">All your data stays on your device</p>
                      </div>
                      
                      <Separator />
                      
                      <p className="text-sm text-muted-foreground">
                        Developed by Dron Pancholi
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </AppLayout>
  );
}
