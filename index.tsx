import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI, Type } from "@google/genai";
import L from "leaflet";
import {
  Shield,
  Users,
  Map as MapIcon,
  AlertTriangle,
  FileText,
  MessageSquare,
  Bell,
  Search,
  CheckCircle,
  Clock,
  DollarSign,
  Menu,
  X,
  Send,
  Cpu,
  MoreVertical,
  TrendingUp,
  Activity,
  Zap,
  BrainCircuit,
  Briefcase,
  Layers,
  BarChart3,
  Globe,
  Smartphone,
  Fingerprint,
  Navigation,
  Camera,
  Satellite,
  Crosshair,
  GitMerge,
  ClipboardCheck,
  Award,
  LogOut,
  Database,
  UserCog,
  Trash2,
  Edit,
  Plus,
  Save,
  Settings,
  RefreshCw,
  Image as ImageIcon,
  Signal as SignalIcon,
  Wifi as WifiIcon,
  Battery as BatteryIcon,
  Printer,
  Download,
  Receipt,
  Banknote,
  Cloud,
  Copy,
  ExternalLink,
  FileJson,
  Check,
  Calendar,
  FileMinus,
  CheckSquare,
  XSquare,
  AlertCircle,
  LayoutDashboard,
  ChevronRight,
  ChevronLeft,
  Upload,
  Table,
  Megaphone,
  BellRing
} from "lucide-react";

// --- Types ---

type Guard = {
  id: string;
  name: string;
  contact: string;
  photoUrl: string;
  status: "On Duty" | "Off Duty" | "Break";
  location: string; 
  assignedRoute: string;
  lat: number;
  lng: number;
  battery: number;
  lastCheckIn: string;
  shift: "Morning" | "Afternoon" | "Night";
  retentionRisk: "Low" | "Medium" | "High";
  trainingNeeds: string[];
  certifications: string[];
  monthlyRate: number;
  semiMonthlyRate: number;
};

type LeaveRequest = {
  id: string;
  guardId: string;
  guardName: string;
  type: "Sick" | "Vacation" | "Emergency";
  date: string;
  daysCount: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
};

type Incident = {
  id: string;
  title: string;
  timestamp: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "Investigating" | "Resolved";
  location: string;
  predictionScore: number;
  description: string;
};

type Client = {
  id: string;
  name: string;
  contractValue: string;
  expiry: string;
  healthScore: number;
  churnRisk: "Low" | "Medium" | "High";
  nextAction: string;
};

type CashAdvance = {
  id: string;
  guardId: string;
  guardName: string;
  amount: number;
  date: string;
  reason: string;
  status: "Pending" | "Approved" | "Paid" | "Rejected";
};

type AppNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'info' | 'success';
};

// --- Mock Data & Helpers ---

const INITIAL_GUARDS: Guard[] = [
  // 3 APS
  { id: "SG-001", name: "Jorwin Arriola", contact: "0917-000-001", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jorwin", status: "On Duty", location: "3 APS", assignedRoute: "Perimeter", lat: 9.6000, lng: 123.9000, battery: 85, lastCheckIn: "10 mins ago", shift: "Morning", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 10000, semiMonthlyRate: 5000 },
  { id: "SG-002", name: "Gucor Refraen", contact: "0917-000-002", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gucor", status: "On Duty", location: "Amikka Bien Unido", assignedRoute: "Main Entrance", lat: 10.1400, lng: 124.3800, battery: 92, lastCheckIn: "5 mins ago", shift: "Morning", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 13000, semiMonthlyRate: 6500 },
  { id: "SG-003", name: "Gonzales", contact: "0917-000-003", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gonzales", status: "On Duty", location: "Kazumi Dauis", assignedRoute: "Lobby", lat: 9.6235, lng: 123.8612, battery: 78, lastCheckIn: "15 mins ago", shift: "Morning", retentionRisk: "Medium", trainingNeeds: [], certifications: [], monthlyRate: 13000, semiMonthlyRate: 6500 },
  { id: "SG-004", name: "Mimbrillos", contact: "0917-000-004", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mimbrillos", status: "Break", location: "Kazumi Dauis", assignedRoute: "Parking", lat: 9.6238, lng: 123.8615, battery: 65, lastCheckIn: "30 mins ago", shift: "Morning", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 13000, semiMonthlyRate: 6500 },
  { id: "SG-005", name: "Lenmark Anora", contact: "0917-000-005", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lenmark", status: "Off Duty", location: "Kazumi Dauis", assignedRoute: "Night Patrol", lat: 9.6232, lng: 123.8610, battery: 100, lastCheckIn: "8 hours ago", shift: "Night", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 13000, semiMonthlyRate: 6500 },
  { id: "SG-006", name: "Rosales Avelito", contact: "0917-000-006", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rosales", status: "On Duty", location: "Kazumi Dauis", assignedRoute: "Rear Gate", lat: 9.6240, lng: 123.8608, battery: 88, lastCheckIn: "2 mins ago", shift: "Afternoon", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 13000, semiMonthlyRate: 6500 },
  { id: "SG-007", name: "Franklin Galias", contact: "0917-000-007", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Franklin", status: "On Duty", location: "Kazumi Dauis", assignedRoute: "Roving", lat: 9.6236, lng: 123.8618, battery: 90, lastCheckIn: "Just now", shift: "Afternoon", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 13000, semiMonthlyRate: 6500 },
  { id: "SG-008", name: "Ryan Mark Morcota", contact: "0917-000-008", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan", status: "On Duty", location: "Kazumi Talibon", assignedRoute: "Main Gate", lat: 10.1512, lng: 124.3312, battery: 95, lastCheckIn: "1 min ago", shift: "Morning", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 13050, semiMonthlyRate: 6525 },
  { id: "SG-009", name: "Trazona Jay", contact: "0917-000-009", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jay", status: "Off Duty", location: "Kazumi Talibon", assignedRoute: "Warehouse", lat: 10.1515, lng: 124.3315, battery: 100, lastCheckIn: "12 hours ago", shift: "Night", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 13050, semiMonthlyRate: 6525 },
  { id: "SG-010", name: "Junathan Pudaran", contact: "0917-000-010", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Junathan", status: "On Duty", location: "Moly Loon", assignedRoute: "Perimeter", lat: 9.7998, lng: 123.7929, battery: 82, lastCheckIn: "20 mins ago", shift: "Morning", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 13050, semiMonthlyRate: 6525 },
  { id: "SG-011", name: "Gino Chris Fabiona", contact: "0917-000-011", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gino", status: "Break", location: "Moly Loon", assignedRoute: "Entrance", lat: 9.8000, lng: 123.7930, battery: 50, lastCheckIn: "5 mins ago", shift: "Afternoon", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 13050, semiMonthlyRate: 6525 },
  { id: "SG-012", name: "Bryan Bolino", contact: "0917-000-012", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bryan", status: "On Duty", location: "PWL Beach Resort", assignedRoute: "Beachfront", lat: 9.5800, lng: 123.7700, battery: 88, lastCheckIn: "10 mins ago", shift: "Morning", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 12000, semiMonthlyRate: 6000 },
  { id: "SG-013", name: "Emiliano Chavez", contact: "0917-000-013", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emiliano", status: "On Duty", location: "Macroland Carmen", assignedRoute: "Main Building", lat: 9.8258, lng: 124.1956, battery: 91, lastCheckIn: "3 mins ago", shift: "Morning", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 12000, semiMonthlyRate: 6000 },
  { id: "SG-014", name: "Ronald Doble", contact: "0917-000-014", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ronald", status: "On Duty", location: "SJL", assignedRoute: "Post 1", lat: 9.7000, lng: 124.0000, battery: 75, lastCheckIn: "15 mins ago", shift: "Morning", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 12900, semiMonthlyRate: 6450 },
  { id: "SG-015", name: "Arnel Patalita", contact: "0917-000-015", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arnel", status: "Break", location: "SJL", assignedRoute: "Post 2", lat: 9.7020, lng: 124.0020, battery: 60, lastCheckIn: "45 mins ago", shift: "Afternoon", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 12900, semiMonthlyRate: 6450 },
  { id: "SG-016", name: "Elisio Monteseven", contact: "0917-000-016", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elisio", status: "Off Duty", location: "SJL", assignedRoute: "Post 3", lat: 9.7010, lng: 124.0010, battery: 100, lastCheckIn: "10 hours ago", shift: "Night", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 12900, semiMonthlyRate: 6450 },
  { id: "SG-017", name: "Trazona Jeffrey", contact: "0917-000-017", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jeffrey", status: "On Duty", location: "Weldon Ubay", assignedRoute: "Main Store", lat: 10.0566, lng: 124.4735, battery: 89, lastCheckIn: "8 mins ago", shift: "Morning", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 13000, semiMonthlyRate: 6500 },
  { id: "SG-018", name: "Edilyn Mendoza", contact: "0917-000-018", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Edilyn", status: "On Duty", location: "Unigo Supermall", assignedRoute: "Entrance", lat: 9.6500, lng: 123.8500, battery: 94, lastCheckIn: "Just now", shift: "Morning", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 12900, semiMonthlyRate: 6450 },
  { id: "SG-019", name: "Conde", contact: "0917-000-019", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Conde", status: "On Duty", location: "Unigo Supermall", assignedRoute: "Roving", lat: 9.6510, lng: 123.8510, battery: 85, lastCheckIn: "12 mins ago", shift: "Afternoon", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 12900, semiMonthlyRate: 6450 },
  { id: "SG-020", name: "Antonio Catagbo", contact: "0917-000-020", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Antonio", status: "On Duty", location: "Wel Don Dept. Store", assignedRoute: "Lobby", lat: 10.0600, lng: 124.4700, battery: 90, lastCheckIn: "5 mins ago", shift: "Morning", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 13050, semiMonthlyRate: 6525 },
  { id: "SG-021", name: "Jay Moral", contact: "0917-000-021", photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=JayMoral", status: "On Duty", location: "Wel Don Dept. Store", assignedRoute: "Perimeter", lat: 10.0610, lng: 124.4710, battery: 88, lastCheckIn: "6 mins ago", shift: "Afternoon", retentionRisk: "Low", trainingNeeds: [], certifications: [], monthlyRate: 13050, semiMonthlyRate: 6525 },
];

const MOCK_INCIDENTS: Incident[] = [
  { id: "INC-2025-001", title: "Suspicious Activity", timestamp: "Dec 18, 2025 22:15", severity: "Medium", status: "Resolved", location: "KAZUMI DAUIS", predictionScore: 12, description: "Unidentified vehicle parked near back perimeter for 20 mins." },
  { id: "INC-2025-002", title: "Predictive: Holiday Crowd", timestamp: "Dec 24, 2025 Prediction", severity: "High", status: "Open", location: "WESTER PANGLAO", predictionScore: 85, description: "Incoming tourist peak likely to exceed standard patrol capacity." },
];

const MOCK_CLIENTS: Client[] = [
  { id: "C-01", name: "Kazumi Group Bohol", contractValue: "₱850k/mo", expiry: "2026-06-30", healthScore: 94, churnRisk: "Low", nextAction: "Q1 Security Audit" },
  { id: "C-02", name: "Molly Enterprise", contractValue: "₱420k/mo", expiry: "2026-12-31", healthScore: 88, churnRisk: "Low", nextAction: "Annual Performance Review" },
  { id: "C-03", name: "Wester Resorts", contractValue: "₱600k/mo", expiry: "2025-12-31", healthScore: 72, churnRisk: "Medium", nextAction: "Contract Renewal Talks" },
];

const MOCK_CASH_ADVANCES: CashAdvance[] = [
  { id: "CA-2026-001", guardId: "SG-Q01", guardName: "Quilaton", amount: 2000, date: "2026-01-20", reason: "Mid-month Advance", status: "Approved" },
  { id: "CA-2026-002", guardId: "SG-D01", guardName: "Dumandan", amount: 2000, date: "2026-01-20", reason: "Mid-month Advance", status: "Approved" },
  { id: "CA-2026-003", guardId: "SG-T01", guardName: "Tuyor", amount: 2000, date: "2026-01-20", reason: "Mid-month Advance", status: "Approved" },
  { id: "CA-2026-004", guardId: "SG-P01", guardName: "Panis", amount: 2000, date: "2026-01-20", reason: "Mid-month Advance", status: "Approved" },
  { id: "CA-2026-005", guardId: "SG-T02", guardName: "Trazona", amount: 2000, date: "2026-01-20", reason: "Mid-month Advance", status: "Approved" },
  { id: "CA-2026-006", guardId: "SG-G01", guardName: "Gonzalez", amount: 2000, date: "2026-01-20", reason: "Mid-month Advance", status: "Approved" },
  { id: "CA-2026-007", guardId: "SG-G02", guardName: "Gucor", amount: 2000, date: "2026-01-20", reason: "Mid-month Advance", status: "Approved" },
  { id: "CA-2026-008", guardId: "SG-P02", guardName: "Pabiona", amount: 2000, date: "2026-01-20", reason: "Mid-month Advance", status: "Approved" },
  { id: "CA-2026-009", guardId: "SG-P03", guardName: "Padillos", amount: 2000, date: "2026-01-20", reason: "Mid-month Advance", status: "Approved" },
  { id: "CA-2026-010", guardId: "SG-Q02", guardName: "Quibao", amount: 2000, date: "2026-01-20", reason: "Mid-month Advance", status: "Approved" },
  { id: "CA-2026-011", guardId: "SG-N01", guardName: "Nudos", amount: 2000, date: "2026-01-20", reason: "Mid-month Advance", status: "Approved" },
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', title: 'Late Check-in', message: 'Guard SG-005 missed 22:00 check-in at Kazumi Dauis.', time: '2 mins ago', read: false, type: 'alert' },
  { id: 'n2', title: 'Report Filed', message: 'Daily Log submitted for 3 APS perimeter patrol.', time: '15 mins ago', read: false, type: 'info' },
  { id: 'n3', title: 'System Update', message: 'AI Prediction Model v2.1 synced successfully.', time: '1 hour ago', read: true, type: 'success' },
];

const WORKFLOW_STEPS = [
  { id: 'login', title: 'START OF SHIFT', subtitle: 'Guard Login', description: 'Biometric Auth • Profile Load • Dashboard Sync', icon: Fingerprint, activeCount: 21, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { id: 'briefing', title: 'PREPARATION', subtitle: 'Daily Briefing', description: 'Route Review • Priority Zones • Weather Check', icon: ClipboardCheck, activeCount: 5, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  { id: 'patrol', title: 'EXECUTION', subtitle: 'Active Patrol', description: 'GPS Tracking • Checkpoints • Incident Reporting', icon: MapIcon, activeCount: 16, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  { id: 'reporting', title: 'COMPLETION', subtitle: 'End-of-Shift', description: 'Log Submission • AI Compilation • Compliance', icon: FileText, activeCount: 0, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { id: 'feedback', title: 'GROWTH', subtitle: 'Training & Feedback', description: 'Performance Eval • Badges • Incentives', icon: Award, activeCount: 0, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  { id: 'database', title: 'DATA LAYER', subtitle: 'Central Database', description: 'Payroll • Analytics • Predictive Planning', icon: Database, activeCount: null, color: 'text-slate-500', bgColor: 'bg-slate-100', isBottom: true }
];

// --- Components ---

const Button = ({ children, onClick, variant = "primary", className = "", disabled = false }: any) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg shadow-indigo-200",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200",
    ghost: "hover:bg-slate-100 text-slate-500 hover:text-slate-800",
    accent: "bg-teal-500 hover:bg-teal-600 text-white shadow-md shadow-teal-200",
  };
  return (
    <button onClick={onClick} className={`px-4 py-3 md:py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-95 touch-manipulation ${variants[variant as keyof typeof variants]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
};

const HoloPanel = ({ children, className = "", title, glowColor = "indigo" }: any) => {
  const decorations: any = {
    cyan: "bg-cyan-500",
    red: "bg-rose-500",
    green: "bg-emerald-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    purple: "bg-purple-500",
    slate: "bg-slate-500",
    indigo: "bg-indigo-500"
  };
  
  return (
    <div className={`bg-white rounded-2xl p-5 md:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${decorations[glowColor] || decorations.indigo}`}></div>
            {title}
          </h3>
          <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
        </div>
      )}
      {children}
    </div>
  );
};

const GuardFormModal = ({ isOpen, onClose, onSubmit, initialData }: { isOpen: boolean, onClose: () => void, onSubmit: (data: Guard) => void, initialData: Partial<Guard> | null }) => {
    const [formData, setFormData] = useState<Partial<Guard>>({});

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || {
                id: `S-${Math.floor(Math.random() * 9000) + 1000}`,
                status: "Off Duty",
                shift: "Morning",
                location: "HQ",
                lat: 9.6,
                lng: 124.0,
                trainingNeeds: [],
                certifications: [],
                battery: 100,
                retentionRisk: "Low",
                lastCheckIn: "N/A",
                photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}&backgroundColor=eef2ff`,
                monthlyRate: 13000,
                semiMonthlyRate: 6500
            });
        }
    }, [isOpen, initialData]);

    const handleChange = (field: keyof Guard, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const generateRandomAvatar = () => {
        const seed = Math.random().toString(36).substring(7);
        const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=eef2ff`;
        setFormData(prev => ({ ...prev, photoUrl: url }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    {initialData?.id ? <Edit className="w-5 h-5 text-indigo-600" /> : <Plus className="w-5 h-5 text-indigo-600" />}
                    {initialData?.id ? "Edit Guard Profile" : "Add New Guard"}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData as Guard); }} className="p-6 space-y-5 overflow-y-auto flex-1">
                    <div className="flex flex-col sm:flex-row items-start gap-5 p-5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-sm overflow-hidden shrink-0 mx-auto sm:mx-0">
                        {formData.photoUrl ? (
                            <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-8 h-8" /></div>
                        )}
                    </div>
                    <div className="flex-1 space-y-3 w-full">
                        <label className="text-xs uppercase text-slate-500 font-bold block tracking-wider">Profile Photo</label>
                        <div className="flex gap-2">
                            <input type="text" value={formData.photoUrl || ""} onChange={e => handleChange("photoUrl", e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" placeholder="https://..." />
                            <button type="button" onClick={generateRandomAvatar} className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-600 transition-colors" title="Generate Random Avatar"><RefreshCw className="w-4 h-4" /></button>
                        </div>
                    </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div><label className="text-xs uppercase text-slate-500 font-bold mb-1.5 block">Full Name</label><input required type="text" value={formData.name || ""} onChange={e => handleChange("name", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" /></div>
                    <div><label className="text-xs uppercase text-slate-500 font-bold mb-1.5 block">Guard ID</label><input required type="text" value={formData.id || ""} onChange={e => handleChange("id", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-mono" /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div><label className="text-xs uppercase text-slate-500 font-bold mb-1.5 block">Contact Number</label><input required type="text" value={formData.contact || ""} onChange={e => handleChange("contact", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" /></div>
                    <div><label className="text-xs uppercase text-slate-500 font-bold mb-1.5 block">Shift</label><select value={formData.shift || "Morning"} onChange={e => handleChange("shift", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"><option value="Morning">Morning</option><option value="Afternoon">Afternoon</option><option value="Night">Night</option></select></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                       <div><label className="text-xs uppercase text-slate-500 font-bold mb-1.5 block">Status</label><select value={formData.status || "Off Duty"} onChange={e => handleChange("status", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"><option value="On Duty">On Duty</option><option value="Off Duty">Off Duty</option><option value="Break">Break</option></select></div>
                       <div><label className="text-xs uppercase text-slate-500 font-bold mb-1.5 block">Assigned Station</label><input required type="text" value={formData.location || ""} onChange={e => handleChange("location", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" placeholder="e.g. KAZUMI DAUIS" /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div><label className="text-xs uppercase text-slate-500 font-bold mb-1.5 block">Latitude</label><input type="number" step="0.0001" value={formData.lat || ""} onChange={e => handleChange("lat", parseFloat(e.target.value))} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-mono" /></div>
                    <div><label className="text-xs uppercase text-slate-500 font-bold mb-1.5 block">Longitude</label><input type="number" step="0.0001" value={formData.lng || ""} onChange={e => handleChange("lng", parseFloat(e.target.value))} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-mono" /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-slate-100 pt-5">
                    <div><label className="text-xs uppercase text-slate-500 font-bold mb-1.5 block">Monthly Rate (₱)</label><input type="number" value={formData.monthlyRate || ""} onChange={e => handleChange("monthlyRate", parseFloat(e.target.value))} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-mono" /></div>
                    <div><label className="text-xs uppercase text-slate-500 font-bold mb-1.5 block">Semi-Mo. Rate (₱)</label><input type="number" value={formData.semiMonthlyRate || ""} onChange={e => handleChange("semiMonthlyRate", parseFloat(e.target.value))} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-mono" /></div>
                    </div>
                    <div className="pt-6 flex gap-4 border-t border-slate-100 mt-4">
                    <Button onClick={(e: any) => { e.preventDefault(); onClose(); }} variant="secondary" className="flex-1 justify-center">Cancel</Button>
                    <Button onClick={() => {}} variant="primary" className="flex-1 justify-center"><Save className="w-4 h-4" /> Save Profile</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PersonnelView = ({ guards, onEdit }: { guards: Guard[], onEdit: (guard: Guard) => void }) => {
    const [filter, setFilter] = useState<string>("All");

    const filteredGuards = guards.filter(g => filter === "All" || g.status === filter);

    const counts = {
        All: guards.length,
        "On Duty": guards.filter(g => g.status === "On Duty").length,
        "Off Duty": guards.filter(g => g.status === "Off Duty").length,
        "Break": guards.filter(g => g.status === "Break").length
    };

    return (
    <div className="h-full flex flex-col gap-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><Users className="w-6 h-6 text-indigo-600" /> Personnel Roster</h2>
           <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm min-w-max">
                 {["All", "On Duty", "Break", "Off Duty"].map(status => (
                     <button
                         key={status}
                         onClick={() => setFilter(status)}
                         className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${filter === status ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                     >
                         {status}
                         <span className={`px-2 py-0.5 rounded-full text-[10px] min-w-[20px] text-center ${filter === status ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                             {counts[status as keyof typeof counts]}
                         </span>
                     </button>
                 ))}
             </div>
           </div>
       </div>
       
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 overflow-y-auto pr-1 pb-4 custom-scrollbar flex-1 min-h-0">
          {filteredGuards.map(guard => (
            <HoloPanel key={guard.id} className="group animate-in fade-in zoom-in-95 duration-300 h-full flex flex-col" glowColor={guard.status === 'On Duty' ? 'green' : (guard.status === 'Break' ? 'amber' : 'slate')}>
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-lg relative flex-shrink-0">
                      <img src={guard.photoUrl} alt={guard.name} className="w-full h-full object-cover bg-slate-100" />
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${guard.status === 'On Duty' ? 'bg-emerald-500' : (guard.status === 'Break' ? 'bg-amber-500' : 'bg-slate-400')}`}></div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{guard.name}</h3>
                    <p className="text-xs text-slate-400 font-medium truncate">{guard.id}</p>
                  </div>
               </div>
               <div className="space-y-2.5 text-xs text-slate-600 flex-1">
                  <div className="flex justify-between items-center"><span className="text-slate-400">Status</span> <span className={`font-semibold px-2 py-0.5 rounded-full ${guard.status === 'On Duty' ? 'bg-emerald-100 text-emerald-700' : (guard.status === 'Break' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600')}`}>{guard.status}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400">Loc</span> <span className="font-medium truncate max-w-[120px]">{guard.location}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400">Rate</span> <span className="font-mono text-slate-700">₱{guard.monthlyRate.toLocaleString()}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400">Shift</span> <span className="font-medium">{guard.shift}</span></div>
               </div>
               <Button onClick={() => onEdit(guard)} className="w-full mt-5 justify-center text-xs" variant="secondary">
                   <Edit className="w-4 h-4" /> Edit Profile
               </Button>
            </HoloPanel>
          ))}
          {filteredGuards.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-sm font-medium">No personnel found in this category.</p>
              </div>
          )}
       </div>
    </div>
    );
};

const HolographicMap = ({ guards }: { guards: Guard[] }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      leafletMap.current = L.map(mapRef.current, { zoomControl: false }).setView([9.8, 124.1], 10);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
      }).addTo(leafletMap.current);
    }
    
    // Invalidate size on resize for responsive map
    const resizeObserver = new ResizeObserver(() => {
       leafletMap.current?.invalidateSize();
    });
    if (mapRef.current) resizeObserver.observe(mapRef.current);
    
    return () => { 
        if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } 
        resizeObserver.disconnect();
    }
  }, []);

  // Helper for mock routes based on guard location
  const getRoutePoints = (lat: number, lng: number, seed: string) => {
    const offset = 0.003;
    const shapeType = seed.charCodeAt(seed.length - 1) % 3;
    
    if (shapeType === 0) { // Triangle
       return [[lat + offset, lng], [lat - offset/2, lng + offset], [lat - offset/2, lng - offset], [lat + offset, lng]];
    } else if (shapeType === 1) { // Square
       return [[lat + offset, lng + offset], [lat - offset, lng + offset], [lat - offset, lng - offset], [lat + offset, lng - offset], [lat + offset, lng + offset]];
    } else { // Line
       return [[lat, lng], [lat + offset, lng + offset], [lat + offset*2, lng], [lat + offset*2, lng - offset*2]];
    }
  };

  const getShiftColor = (shift: string) => {
      if (shift === 'Morning') return '#4f46e5'; // Indigo
      if (shift === 'Afternoon') return '#059669'; // Emerald
      if (shift === 'Night') return '#e11d48'; // Rose
      return '#64748b';
  };

  useEffect(() => {
    if (leafletMap.current) {
      // Clear layers
      leafletMap.current.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.Polygon) {
             leafletMap.current?.removeLayer(layer);
        }
      });

      guards.forEach(guard => {
        const color = getShiftColor(guard.shift);
        const routePoints = getRoutePoints(guard.lat, guard.lng, guard.id);
        
        // Draw Route
        L.polyline(routePoints as L.LatLngExpression[], {
            color: color,
            weight: 4,
            opacity: 0.6,
            lineCap: 'round',
            lineJoin: 'round',
            dashArray: guard.status === 'On Duty' ? '' : '10, 10'
        }).addTo(leafletMap.current!);

        // Draw Guard Avatar Marker
        const iconHtml = `
          <div style="position: relative; width: 44px; height: 44px; transition: transform 0.2s;">
            <img src="${guard.photoUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.15); background: white;" />
            <div style="position: absolute; bottom: 0; right: 0; width: 14px; height: 14px; background-color: ${guard.status === 'On Duty' ? '#10b981' : '#fbbf24'}; border: 2px solid white; border-radius: 50%;"></div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'custom-avatar-icon hover:z-50',
          html: iconHtml,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
          popupAnchor: [0, -22]
        });

        L.marker([guard.lat, guard.lng], { icon })
          .addTo(leafletMap.current!)
          .bindPopup(`
            <div class="p-4 min-w-[200px] font-sans">
                <div class="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                    <img src="${guard.photoUrl}" class="w-10 h-10 rounded-full bg-slate-100">
                    <div>
                        <div class="font-bold text-slate-800 text-sm">${guard.name}</div>
                        <div class="text-[10px] text-slate-500 font-mono">${guard.id}</div>
                    </div>
                </div>
                <div class="space-y-2 text-xs text-slate-600">
                    <div class="flex justify-between"><span class="text-slate-400">Shift</span> <span style="color: ${color}" class="font-bold">${guard.shift}</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">Route</span> <span class="font-medium">${guard.assignedRoute}</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">Status</span> <span class="font-medium">${guard.status}</span></div>
                </div>
            </div>
          `);
      });
    }
  }, [guards]);

  return <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden border border-slate-200 relative z-0 min-h-[300px] shadow-sm" />;
};

const DashboardView = ({ aiClient, guards }: { aiClient: GoogleGenAI | null, guards: Guard[] }) => {
  const onDutyCount = guards.filter(g => g.status === 'On Duty').length;
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <HoloPanel title="Active Force" glowColor="green" className="bg-gradient-to-br from-white to-emerald-50/50">
          <div className="text-3xl md:text-4xl font-bold text-slate-800">{onDutyCount} <span className="text-slate-400 text-xl font-normal">/ {guards.length}</span></div>
          <div className="text-sm text-emerald-600 mt-1 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Units Online</div>
        </HoloPanel>
        <HoloPanel title="Incidents" glowColor="red" className="bg-gradient-to-br from-white to-rose-50/50">
          <div className="text-3xl md:text-4xl font-bold text-slate-800">2</div>
          <div className="text-sm text-rose-600 mt-1 font-medium">Active Alerts</div>
        </HoloPanel>
        <HoloPanel title="Payroll Est." glowColor="purple" className="bg-gradient-to-br from-white to-purple-50/50">
          <div className="text-3xl md:text-4xl font-bold text-slate-800">₱124k</div>
          <div className="text-sm text-purple-600 mt-1 font-medium">Cycle Projection</div>
        </HoloPanel>
        <HoloPanel title="System Status" glowColor="blue" className="bg-gradient-to-br from-white to-blue-50/50">
          <div className="text-3xl md:text-4xl font-bold text-slate-800">99%</div>
          <div className="text-sm text-blue-600 mt-1 font-medium">Operational</div>
        </HoloPanel>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        <div className="lg:col-span-2 h-full flex flex-col min-h-[400px]">
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Live Deployment</h3>
             <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-full">Real-time</span>
          </div>
          <div className="flex-1 h-full"><HolographicMap guards={guards} /></div>
        </div>
        <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar">
           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recent Intelligence</h3>
           {MOCK_INCIDENTS.map(inc => (
             <div key={inc.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
               <div className="flex justify-between items-start mb-3">
                 <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${inc.severity === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>{inc.severity}</span>
                 <span className="text-xs text-slate-400">{inc.timestamp}</span>
               </div>
               <h4 className="font-bold text-slate-800 text-base mb-1">{inc.title}</h4>
               <p className="text-sm text-slate-500 leading-relaxed">{inc.description}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

const OperationsView = ({ guards, onScatter }: { guards: Guard[], onScatter: () => void }) => (
    <div className="h-full flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><MapIcon className="w-6 h-6 text-indigo-600" /> Live Operations</h2>
        <Button onClick={onScatter} variant="secondary" className="text-xs"><RefreshCw className="w-4 h-4" /> Reset Sim</Button>
      </div>
      <div className="flex-1 min-h-[400px] md:min-h-[500px]"><HolographicMap guards={guards} /></div>
    </div>
);

const ClientIntelligenceView = ({ aiClient }: { aiClient: GoogleGenAI | null }) => (
    <div className="h-full flex flex-col gap-6">
        <div className="flex justify-between items-center">
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><Globe className="w-6 h-6 text-blue-600" /> Client Intelligence</h2>
           <div className="text-xs text-slate-500 font-medium bg-white px-3 py-1.5 rounded-full border border-slate-200">Last updated: Just now</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-4 custom-scrollbar">
           {MOCK_CLIENTS.map(client => (
               <HoloPanel key={client.id} glowColor="blue" className="flex flex-col gap-5 h-full">
                   <div className="flex justify-between items-start">
                       <div>
                           <h3 className="font-bold text-xl text-slate-900">{client.name}</h3>
                           <p className="text-sm text-slate-500 font-medium">{client.contractValue}</p>
                       </div>
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${client.healthScore > 90 ? 'bg-emerald-100 text-emerald-700' : client.healthScore > 75 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                           {client.healthScore}
                       </div>
                   </div>
                   
                   <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                       <div className="flex justify-between text-sm">
                           <span className="text-slate-500">Churn Risk</span>
                           <span className={`font-bold ${client.churnRisk === 'Low' ? 'text-emerald-600' : 'text-amber-600'}`}>{client.churnRisk}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                           <span className="text-slate-500">Expiry</span>
                           <span className="text-slate-700 font-medium">{client.expiry}</span>
                       </div>
                       <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                           <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${client.healthScore}%` }}></div>
                       </div>
                   </div>
                   
                   <div className="mt-auto pt-4 border-t border-slate-100">
                       <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider mb-2">Recommended Action</div>
                       <div className="text-sm text-slate-700 flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                           <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                           {client.nextAction}
                       </div>
                   </div>
               </HoloPanel>
           ))}
        </div>
    </div>
);

// --- Daily Logs View Component (Google Form Style) ---

const DailyLogsView = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    // Section 1: Identity
    fullName: "Jorwin Arriola",
    guardId: "SG-001",
    assignedPost: "3 APS",
    shiftSchedule: "Morning",
    contactNumber: "0917-000-001",
    supervisorName: "",
    biometricPin: "",
    
    // Section 2: Start Shift
    shiftStartTime: "06:00",
    uniformComplete: "Yes",
    equipment: [] as string[],
    postCondition: "",
    clientAreaStatus: "Normal",
    
    // Section 3: Execution
    patrolRounds: 0,
    incidentObserved: "No",
    visitorCount: 0,
    accessControlChecked: "Yes",
    patrolIntervals: [] as string[],
    executionNotes: "",
    incidentDetails: { type: "", description: "", action: "" },
    
    // Section 4: Completion
    shiftEndTime: "18:00",
    tasksCompleted: [] as string[],
    pendingIssues: "",
    turnoverNotes: "",
    completionStatus: "Smooth",
    
    // Section 5: Growth
    wentWell: "",
    improvements: "",
    skillsNeeded: [] as string[],
    performanceRating: 5
  });

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCheckbox = (field: string, item: string) => {
    setFormData((prev: any) => {
      const list = prev[field] as string[];
      if (list.includes(item)) return { ...prev, [field]: list.filter(i => i !== item) };
      return { ...prev, [field]: [...list, item] };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsComplete(true);
  };

  const downloadAttendanceCard = () => {
    const timestamp = new Date().toLocaleString();
    const refId = `ATT-${Math.floor(Math.random()*1000000).toString().padStart(6, '0')}`;
    const bioHash = (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).toUpperCase();
    
    // Formal Layout
    const content = `
________________________________________________________________________________
                                                                                
                       S E C U R E O P S   A I   C O M M A N D                  
                          OFFICIAL DUTY PERFORMANCE RECORD                      
________________________________________________________________________________

 DOCUMENT CONTROL                                                               
 Ref No      : ${refId}                                                         
 Date Filed  : ${timestamp}                                                     
 Status      : VERIFIED & LOCKED                                                
________________________________________________________________________________

 [ 1 ] PERSONNEL IDENTITY                                                       
                                                                                
    Officer Name      : ${formData.fullName.toUpperCase().padEnd(30)}           
    Badge / ID No     : ${formData.guardId.toUpperCase().padEnd(30)}            
    Assigned Post     : ${formData.assignedPost.toUpperCase().padEnd(30)}       
    Designation       : SECURITY OFFICER                                        
                                                                                
________________________________________________________________________________

 [ 2 ] TIMEKEEPING & SCHEDULE                                                   
                                                                                
    Shift Schedule    : ${formData.shiftSchedule}                               
    Actual Time In    : ${formData.shiftStartTime}                              
    Actual Time Out   : ${formData.shiftEndTime}                                
    Shift Duration    : 12 HOURS (STANDARD)                                     
    Uniform Compliance: ${formData.uniformComplete.toUpperCase()}               
                                                                                
________________________________________________________________________________

 [ 3 ] OPERATIONAL SUMMARY                                                      
                                                                                
    Patrols Conducted : ${formData.patrolRounds} Rounds                         
    Visitors Logged   : ${formData.visitorCount} Pax                            
    Incidents Reported: ${formData.incidentObserved.toUpperCase()}              
                                                                                
    KEY TURNOVER NOTES:                                                         
    ${(formData.turnoverNotes || "No specific handover notes recorded.").replace(/\n/g, '\n    ')}
                                                                                
________________________________________________________________________________

 [ 4 ] OFFICER DECLARATION                                                      
                                                                                
    I hereby certify that the above record of my duty is true and correct.      
    I understand that any falsification is subject to disciplinary action.      
                                                                                
    Performance Rating: ${formData.performanceRating} / 5                       
    Self-Assessment   : ${formData.wentWell || "N/A"}                           
                                                                                
                                                                                
    [ DIGITAL SIGNATURE VERIFIED ]                                              
    ${formData.fullName.toUpperCase()}                                          
    ${new Date().toLocaleDateString()}                                          
                                                                                
________________________________________________________________________________
 SYSTEM METADATA                                                                
 Bio-Auth Hash : ${bioHash}                                                     
 Terminal Node : OPSCEN-HQ-01                                                   
 Geo-Stamp     : ${9.6 + (Math.random() * 0.1)}, ${123.9 + (Math.random() * 0.1)} (Verified)
________________________________________________________________________________
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DTR_${formData.guardId}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isComplete) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4 md:p-8 animate-in fade-in duration-500">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-50">
          <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-emerald-600" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">Shift Report Submitted</h2>
        <p className="text-slate-500 max-w-md mb-10 text-base md:text-lg">
          Your Daily Log has been successfully synced to the Guard Force Dashboard.
          <br/>Reference: <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded ml-2">LOG-{Math.floor(Math.random()*100000)}</span>
        </p>
        <div className="flex flex-col gap-4 w-full max-w-sm">
            <Button onClick={() => window.open('https://docs.google.com/spreadsheets/d/1qORrjoVFpHHwosslJCHxbSTHQV7L0wzv/copy', '_blank')} variant="primary" className="justify-center w-full py-4 text-base shadow-lg shadow-indigo-100">
               <Copy className="w-5 h-5" /> Get Attendance Card
            </Button>
            <Button onClick={downloadAttendanceCard} variant="secondary" className="justify-center w-full">
               <FileText className="w-4 h-4" /> Download Official DTR
            </Button>
            <div className="h-4"></div>
            <button onClick={() => { setIsComplete(false); setStep(1); }} className="text-slate-400 hover:text-slate-600 text-sm font-semibold transition-colors">
                Start New Log
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <div>
           <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-3">
             <FileText className="w-6 h-6 text-indigo-600" /> Daily Logs
           </h2>
           <p className="text-sm text-slate-500 mt-1 font-medium">Guard Force Reporting System</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">STEP {step} OF 5</div>
        </div>
      </div>

      <div className="w-full h-1.5 bg-slate-100 rounded-full mb-6 md:mb-8 overflow-hidden">
        <div className="h-full bg-indigo-600 transition-all duration-500 ease-out rounded-full" style={{ width: `${(step/5)*100}%` }}></div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
        <div className="bg-white rounded-2xl p-5 md:p-8 border border-slate-100 shadow-sm min-h-[400px]">
            {/* --- SECTION 1: PROFILE LOAD --- */}
            {step === 1 && (
              <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-8 fade-in duration-300">
                 <div className="border-b border-slate-100 pb-5">
                   <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-3"><Fingerprint className="w-6 h-6 text-indigo-500" /> Identify Verification</h3>
                   <p className="text-sm text-slate-500 mt-1">Permanent identity confirmation required.</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs uppercase text-slate-500 font-bold mb-2 block">Full Name *</label>
                      <input type="text" value={formData.fullName} onChange={e => handleInputChange("fullName", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" placeholder="Enter full name" />
                    </div>
                    <div>
                      <label className="text-xs uppercase text-slate-500 font-bold mb-2 block">Guard ID Number *</label>
                      <input type="text" value={formData.guardId} onChange={e => handleInputChange("guardId", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-mono" placeholder="Ex: SG-2025-001" />
                    </div>
                    <div>
                      <label className="text-xs uppercase text-slate-500 font-bold mb-2 block">Assigned Post *</label>
                      <input type="text" value={formData.assignedPost} onChange={e => handleInputChange("assignedPost", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-xs uppercase text-slate-500 font-bold mb-2 block">Shift Schedule *</label>
                      <select value={formData.shiftSchedule} onChange={e => handleInputChange("shiftSchedule", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all">
                        <option>Morning</option>
                        <option>Afternoon</option>
                        <option>Night</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs uppercase text-slate-500 font-bold mb-2 block">Biometric Auth PIN *</label>
                      <input type="password" value={formData.biometricPin} onChange={e => handleInputChange("biometricPin", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-mono tracking-widest text-center text-lg" placeholder="••••••" maxLength={6} />
                    </div>
                 </div>
              </div>
            )}

            {/* --- SECTION 2: START SHIFT --- */}
            {step === 2 && (
              <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-8 fade-in duration-300">
                 <div className="border-b border-slate-100 pb-5">
                   <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-3"><Clock className="w-6 h-6 text-cyan-500" /> Shift Start</h3>
                   <p className="text-sm text-slate-500 mt-1">Operational readiness check.</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-xs uppercase text-slate-500 font-bold mb-2 block">Shift Start Time</label>
                      <input type="time" value={formData.shiftStartTime} onChange={e => handleInputChange("shiftStartTime", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs uppercase text-slate-500 font-bold mb-2 block">Uniform Complete?</label>
                      <div className="flex gap-4">
                        <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-lg border transition-all ${formData.uniformComplete === "Yes" ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                          <input type="radio" checked={formData.uniformComplete === "Yes"} onChange={() => handleInputChange("uniformComplete", "Yes")} className="accent-emerald-500 hidden" />
                          <CheckCircle className="w-4 h-4" /> <span className="text-sm font-bold">Yes</span>
                        </label>
                        <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-lg border transition-all ${formData.uniformComplete === "No" ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                          <input type="radio" checked={formData.uniformComplete === "No"} onChange={() => handleInputChange("uniformComplete", "No")} className="accent-rose-500 hidden" />
                          <X className="w-4 h-4" /> <span className="text-sm font-bold">No</span>
                        </label>
                      </div>
                    </div>
                 </div>
                 
                 <div>
                    <label className="text-xs uppercase text-slate-500 font-bold mb-3 block">Equipment Issued Checklist</label>
                    <div className="grid grid-cols-2 gap-3">
                      {["Radio", "Logbook", "Flashlight", "Body Cam", "ID Badge", "Baton"].map(item => (
                        <label key={item} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.equipment.includes(item) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-600'}`}>
                           <input type="checkbox" checked={formData.equipment.includes(item)} onChange={() => toggleCheckbox("equipment", item)} className="accent-indigo-600 w-4 h-4" />
                           <span className="text-sm font-medium">{item}</span>
                        </label>
                      ))}
                    </div>
                 </div>

                 <div>
                    <label className="text-xs uppercase text-slate-500 font-bold mb-2 block">Post Condition Upon Arrival</label>
                    <textarea value={formData.postCondition} onChange={e => handleInputChange("postCondition", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none h-24" placeholder="Describe any issues or note 'Normal'..." />
                 </div>
              </div>
            )}

            {/* --- SECTION 3: EXECUTION --- */}
            {step === 3 && (
              <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-8 fade-in duration-300">
                 <div className="border-b border-slate-100 pb-5">
                   <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-3"><MapIcon className="w-6 h-6 text-emerald-500" /> Execution Phase</h3>
                   <p className="text-sm text-slate-500 mt-1">Live ops monitoring and incident logging.</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-xs uppercase text-slate-500 font-bold mb-2 block">Patrol Rounds Completed</label>
                      <input type="number" min="0" value={formData.patrolRounds} onChange={e => handleInputChange("patrolRounds", parseInt(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs uppercase text-slate-500 font-bold mb-2 block">Visitor Count Logged</label>
                      <input type="number" min="0" value={formData.visitorCount} onChange={e => handleInputChange("visitorCount", parseInt(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
                    </div>
                 </div>
                 
                 <div>
                    <label className="text-xs uppercase text-slate-500 font-bold mb-2 block">Incident Observed?</label>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-4 rounded-lg border transition-all ${formData.incidentObserved === "Yes" ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                          <input type="radio" checked={formData.incidentObserved === "Yes"} onChange={() => handleInputChange("incidentObserved", "Yes")} className="hidden" />
                          <AlertTriangle className="w-5 h-5" /> <span className="font-bold">Yes, Report Incident</span>
                        </label>
                        <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-4 rounded-lg border transition-all ${formData.incidentObserved === "No" ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                          <input type="radio" checked={formData.incidentObserved === "No"} onChange={() => handleInputChange("incidentObserved", "No")} className="hidden" />
                          <CheckCircle className="w-5 h-5" /> <span className="font-bold">No, Smooth Operations</span>
                        </label>
                    </div>
                    
                    {formData.incidentObserved === "Yes" && (
                       <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 space-y-4 animate-in zoom-in-95">
                          <h4 className="text-sm font-bold text-rose-700 uppercase tracking-wide">Incident Report Details</h4>
                          <div>
                             <label className="text-xs uppercase text-slate-500 block mb-1.5 font-bold">Incident Type</label>
                             <select className="w-full bg-white border border-rose-200 rounded-lg p-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-rose-200">
                                <option>Theft / Loss</option>
                                <option>Trespassing</option>
                                <option>Vandalism</option>
                                <option>Medical Emergency</option>
                                <option>Other</option>
                             </select>
                          </div>
                          <div>
                             <label className="text-xs uppercase text-slate-500 block mb-1.5 font-bold">Description</label>
                             <textarea className="w-full bg-white border border-rose-200 rounded-lg p-3 text-slate-800 outline-none h-24 focus:ring-2 focus:ring-rose-200" placeholder="Provide detailed account..." />
                          </div>
                       </div>
                    )}
                 </div>
              </div>
            )}

            {/* --- SECTION 4 & 5: COMPLETION & GROWTH (Simulated for brevity) --- */}
            {(step === 4 || step === 5) && (
              <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300">
                 <div className="border-b border-slate-100 pb-5">
                   <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-3"><CheckSquare className="w-6 h-6 text-amber-500" /> Completion & Growth</h3>
                   <p className="text-sm text-slate-500 mt-1">End-of-shift handover and performance reflection.</p>
                 </div>
                 
                 {/* Simplified fields for modern look */}
                 <div>
                    <label className="text-xs uppercase text-slate-500 font-bold mb-2 block">Shift End Time</label>
                    <input type="time" value={formData.shiftEndTime} onChange={e => handleInputChange("shiftEndTime", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
                 </div>
                 
                 <div>
                    <label className="text-xs uppercase text-slate-500 font-bold mb-2 block">Personal Rating</label>
                    <div className="flex gap-2">
                       {[1, 2, 3, 4, 5].map(num => (
                          <button 
                             key={num} 
                             onClick={() => handleInputChange("performanceRating", num)}
                             className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${formData.performanceRating === num ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                          >
                             {num}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <label className="text-xs uppercase text-slate-500 font-bold mb-2 block">Notes</label>
                    <textarea value={formData.turnoverNotes} onChange={e => handleInputChange("turnoverNotes", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none h-32" placeholder="Any final remarks..." />
                 </div>
              </div>
            )}
        </div>
      </div>

      <div className="flex justify-between mt-6 md:mt-8 pt-4 border-t border-slate-200">
         <Button onClick={prevStep} disabled={step === 1} variant="secondary">
            <ChevronLeft className="w-4 h-4" /> Back
         </Button>
         
         {step < 5 ? (
            <Button onClick={nextStep} variant="primary">
               Continue <ChevronRight className="w-4 h-4" />
            </Button>
         ) : (
            <Button onClick={handleSubmit} variant="primary" className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200" disabled={isSubmitting}>
               {isSubmitting ? "Syncing..." : "Submit Log"} <Send className="w-4 h-4" />
            </Button>
         )}
      </div>
    </div>
  );
};

const PayrollView = ({ guards }: { guards: Guard[] }) => {
    const [advances, setAdvances] = useState<CashAdvance[]>(MOCK_CASH_ADVANCES);
    const [viewMode, setViewMode] = useState<'advances' | 'rates'>('advances');

    const downloadReceipt = (advance: CashAdvance) => {
        // ... existing logic ...
        alert("Downloading Receipt...");
    };

    const exportData = () => {
      let content = "";
      let filename = "";

      if (viewMode === 'advances') {
        const headers = ["Ref ID", "Guard Name", "Guard ID", "Date", "Reason", "Amount", "Status"];
        const rows = advances.map(a => [
          a.id, `"${a.guardName}"`, a.guardId, a.date, `"${a.reason}"`, a.amount, a.status
        ].join(","));
        content = [headers.join(","), ...rows].join("\n");
        filename = `Advances_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        const headers = ["Guard ID", "Name", "Location", "Shift", "Status", "Monthly Rate", "Semi-Monthly Rate"];
        const rows = guards.map(g => [
          g.id, `"${g.name}"`, `"${g.location}"`, g.shift, g.status, g.monthlyRate, g.semiMonthlyRate
        ].join(","));
        content = [headers.join(","), ...rows].join("\n");
        filename = `Payroll_Rates_${new Date().toISOString().split('T')[0]}.csv`;
      }

      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    };

    return (
        <div className="h-full flex flex-col gap-6">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                   <Banknote className="w-6 h-6 text-emerald-600" /> Payroll & Advances
               </h2>
               <div className="flex gap-3 w-full md:w-auto">
                 <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex-1 md:flex-none">
                    <button onClick={() => setViewMode('advances')} className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'advances' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Advances</button>
                    <button onClick={() => setViewMode('rates')} className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'rates' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>Rate Sheet</button>
                 </div>
                 <Button onClick={exportData} variant="secondary" className="text-xs whitespace-nowrap">
                     <Download className="w-4 h-4" /> Export {viewMode === 'advances' ? 'Advances' : 'Payroll'}
                 </Button>
               </div>
           </div>
           
           <HoloPanel className="flex-1 overflow-hidden flex flex-col p-0" glowColor="emerald">
              <div className="overflow-x-auto flex-1 custom-scrollbar">
                 {viewMode === 'advances' ? (
                   <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500 sticky top-0 backdrop-blur-sm z-10 border-b border-slate-200">
                         <tr>
                            <th className="p-4 font-semibold">Ref ID</th>
                            <th className="p-4 font-semibold">Guard</th>
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold">Reason</th>
                            <th className="p-4 font-semibold">Amount</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Receipt</th>
                         </tr>
                      </thead>
                      <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                         {advances.map(adv => (
                            <tr key={adv.id} className="hover:bg-slate-50 transition-colors group">
                               <td className="p-4 font-mono text-xs text-slate-400">{adv.id}</td>
                               <td className="p-4">
                                   <div className="font-bold text-slate-800">{adv.guardName}</div>
                                   <div className="text-[10px] text-slate-400 font-mono">{adv.guardId}</div>
                               </td>
                               <td className="p-4 text-xs">{adv.date}</td>
                               <td className="p-4 text-xs">{adv.reason}</td>
                               <td className="p-4 font-mono font-bold text-emerald-600">₱{adv.amount.toLocaleString()}</td>
                               <td className="p-4">
                                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${adv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : (adv.status === 'Approved' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100')}`}>
                                     {adv.status}
                                  </span>
                               </td>
                               <td className="p-4 text-right">
                                  <button onClick={() => downloadReceipt(adv)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                                      <Receipt className="w-4 h-4" />
                                  </button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                 ) : (
                   <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500 sticky top-0 backdrop-blur-sm z-10 border-b border-slate-200">
                         <tr>
                            <th className="p-4">Area / Location</th>
                            <th className="p-4">Guard Name</th>
                            <th className="p-4">Monthly Rate</th>
                            <th className="p-4">Semi-Mo. Rate</th>
                            <th className="p-4">Base Days</th>
                         </tr>
                      </thead>
                      <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                         {guards.map(g => (
                            <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                               <td className="p-4 font-bold text-slate-800">{g.location}</td>
                               <td className="p-4">{g.name}</td>
                               <td className="p-4 font-mono text-slate-700">₱{g.monthlyRate.toLocaleString()}</td>
                               <td className="p-4 font-mono text-slate-500">₱{g.semiMonthlyRate.toLocaleString()}</td>
                               <td className="p-4 text-slate-400">15</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                 )}
              </div>
           </HoloPanel>
        </div>
    );
};

const WorkflowBlueprintView = () => {
  return (
    <div className="h-full flex flex-col">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 px-4 gap-4">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
             <GitMerge className="w-6 h-6 text-indigo-600" /> Operational Blueprint
          </h2>
          <div className="flex gap-3 text-xs font-bold text-slate-500 bg-white p-2 rounded-lg border border-slate-200 shadow-sm overflow-x-auto w-full sm:w-auto">
             <div className="flex items-center gap-1.5 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> START</div>
             <div className="flex items-center gap-1.5 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> ACTIVE</div>
             <div className="flex items-center gap-1.5 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> FEEDBACK</div>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto relative custom-scrollbar px-4 sm:px-10 pb-20">
          <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 sm:-translate-x-1/2"></div>
          <div className="space-y-12 max-w-5xl mx-auto relative">
             {WORKFLOW_STEPS.map((step, index) => (
                <div key={step.id} className={`relative flex items-center ${index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'} group flex-row`}>
                   <div className={`absolute left-6 sm:left-1/2 -translate-x-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white border-4 border-slate-100 z-10 flex items-center justify-center shadow-lg sm:group-hover:scale-110 transition-transform duration-300 ${step.color}`}>
                      <step.icon className="w-5 h-5 sm:w-7 sm:h-7" />
                   </div>
                   <div className={`w-full sm:w-[calc(50%-4rem)] pl-16 sm:pl-0 ${index % 2 === 0 ? 'sm:text-right sm:pr-12' : 'sm:text-left sm:pl-12'}`}>
                      <div className={`bg-white p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-default relative overflow-hidden sm:group-hover:-translate-y-1 border border-slate-100`}>
                         <div className={`absolute top-0 left-0 w-1.5 h-full ${step.bgColor.replace('bg-', 'bg-').replace('50', '500')}`}></div>
                         <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${step.color}`}>{step.title}</h4>
                         <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3">{step.subtitle}</h3>
                         <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                         {step.activeCount !== null && (
                            <div className={`mt-5 flex items-center gap-2 text-xs font-bold ${index % 2 === 0 ? 'sm:justify-end' : 'sm:justify-start'} ${step.color}`}>
                               <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                               {step.activeCount} Units Active
                            </div>
                         )}
                      </div>
                   </div>
                   <div className="hidden sm:block sm:w-[calc(50%-4rem)]"></div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
}

const AdminView = ({ guards, onAdd, onEdit, onDelete, leaves, onAddLeave, onUpdateLeave }: { 
  guards: Guard[], 
  onAdd: () => void, 
  onEdit: (g: Guard) => void, 
  onDelete: (id: string) => void,
  leaves: LeaveRequest[],
  onAddLeave: (l: LeaveRequest) => void,
  onUpdateLeave: (id: string, status: "Approved" | "Rejected") => void
}) => {
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [leaveFormData, setLeaveFormData] = useState<Partial<LeaveRequest>>({
      type: "Sick", daysCount: 1, reason: ""
    });
    const [selectedGuardForLeave, setSelectedGuardForLeave] = useState<Guard | null>(null);

    const openLeaveModal = (guard: Guard) => {
      setSelectedGuardForLeave(guard);
      setLeaveFormData({
        id: `LR-${Math.floor(Math.random() * 90000)}`,
        guardId: guard.id,
        guardName: guard.name,
        type: "Sick",
        daysCount: 1,
        reason: "",
        status: "Pending",
        date: new Date().toLocaleDateString()
      });
      setIsLeaveModalOpen(true);
    }

    const handleLeaveSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedGuardForLeave) {
        onAddLeave(leaveFormData as LeaveRequest);
      }
      setIsLeaveModalOpen(false);
    }
  
    const pendingLeaves = leaves.filter(l => l.status === 'Pending');
  
    return (
      <div className="h-full flex flex-col gap-6">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HoloPanel className="md:col-span-2 min-h-[150px]" glowColor="amber" title="Pending Leave Requests">
                {pendingLeaves.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-sm">
                    <Calendar className="w-8 h-8 mb-2 opacity-50" />
                    No pending requests
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[200px] space-y-3 pr-2 custom-scrollbar">
                    {pendingLeaves.map(leave => (
                      <div key={leave.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center group hover:shadow-sm transition-all">
                        <div>
                          <div className="flex items-center gap-2">
                             <span className="font-bold text-slate-800 text-sm">{leave.guardName}</span>
                             <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${leave.type === 'Sick' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>{leave.type}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1 font-medium">{leave.daysCount} day(s) • {leave.reason}</div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => onUpdateLeave(leave.id, 'Approved')} className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg transition-colors" title="Approve"><CheckSquare className="w-4 h-4" /></button>
                           <button onClick={() => onUpdateLeave(leave.id, 'Rejected')} className="p-2 bg-rose-100 text-rose-600 hover:bg-rose-200 rounded-lg transition-colors" title="Reject"><XSquare className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </HoloPanel>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <UserCog className="w-5 h-5 text-indigo-600" /> Guard Mgmt
                  </h2>
                  <Button onClick={onAdd} variant="primary" className="py-1.5 px-3 text-xs">
                    <Plus className="w-4 h-4" /> Add New
                  </Button>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex-1 flex flex-col justify-center">
                 <div className="text-xs text-slate-400 mb-3 font-bold uppercase tracking-wider">Leave Stats (Current Cycle)</div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                       <div className="text-2xl font-bold text-emerald-700">{leaves.filter(l => l.status === 'Approved').length}</div>
                       <div className="text-[10px] font-bold text-emerald-500 uppercase">Approved</div>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                       <div className="text-2xl font-bold text-amber-700">{leaves.filter(l => l.status === 'Pending').length}</div>
                       <div className="text-[10px] font-bold text-amber-500 uppercase">Pending</div>
                    </div>
                 </div>
              </div>
            </div>
         </div>
  
         <HoloPanel className="flex-1 overflow-hidden flex flex-col p-0" glowColor="indigo">
            <div className="overflow-x-auto flex-1 custom-scrollbar">
               <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 sticky top-0 backdrop-blur-sm z-10 border-b border-slate-200">
                     <tr>
                        <th className="p-4 font-semibold">Profile</th>
                        <th className="p-4 font-semibold">ID</th>
                        <th className="p-4 font-semibold">Name</th>
                        <th className="p-4 font-semibold">Area</th>
                        <th className="p-4 font-semibold">Shift</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Contact</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                     {guards.map(g => (
                        <tr key={g.id} className="hover:bg-slate-50 transition-colors group">
                           <td className="p-4">
                             <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                <img src={g.photoUrl} alt={g.name} className="w-full h-full object-cover" />
                             </div>
                           </td>
                           <td className="p-4 font-mono text-indigo-600 text-xs">{g.id}</td>
                           <td className="p-4 font-bold text-slate-800">{g.name}</td>
                           <td className="p-4 max-w-[150px] truncate">{g.location}</td>
                           <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">{g.shift}</span></td>
                           <td className="p-4">
                              <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${g.status === 'On Duty' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-slate-200 text-slate-500 bg-slate-50'}`}>
                                 {g.status}
                              </span>
                           </td>
                           <td className="p-4 font-mono text-xs">{g.contact}</td>
                           <td className="p-4 text-right">
                              <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => openLeaveModal(g)} className="p-1.5 hover:bg-amber-100 text-slate-400 hover:text-amber-600 rounded transition-colors" title="File Leave Request"><FileMinus className="w-4 h-4" /></button>
                                 <button onClick={() => onEdit(g)} className="p-1.5 hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 rounded transition-colors"><Edit className="w-4 h-4" /></button>
                                 <button onClick={() => onDelete(g.id)} className="p-1.5 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </HoloPanel>

         {/* Leave Modal */}
         {isLeaveModalOpen && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                           <Calendar className="w-5 h-5 text-amber-500" /> File Leave Request
                        </h3>
                        <button onClick={() => setIsLeaveModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleLeaveSubmit} className="p-6 space-y-5">
                        <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-sm text-indigo-900 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                                {selectedGuardForLeave?.name.charAt(0)}
                            </div>
                            <div>Filing for <span className="font-bold">{selectedGuardForLeave?.name}</span></div>
                        </div>
                        
                        <div>
                            <label className="text-xs uppercase text-slate-500 font-bold mb-1.5 block">Leave Type</label>
                            <select value={leaveFormData.type} onChange={(e) => setLeaveFormData(prev => ({...prev, type: e.target.value as any}))} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all">
                                <option value="Sick">Sick Leave</option>
                                <option value="Vacation">Vacation Leave</option>
                                <option value="Emergency">Emergency Leave</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs uppercase text-slate-500 font-bold mb-1.5 block">Number of Days</label>
                            <input type="number" min="1" max="15" value={leaveFormData.daysCount} onChange={(e) => setLeaveFormData(prev => ({...prev, daysCount: parseInt(e.target.value)}))} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
                        </div>

                        <div>
                            <label className="text-xs uppercase text-slate-500 font-bold mb-1.5 block">Reason / Remarks</label>
                            <textarea value={leaveFormData.reason} onChange={(e) => setLeaveFormData(prev => ({...prev, reason: e.target.value}))} className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none h-24 transition-all" placeholder="Optional details..." />
                        </div>

                        <div className="pt-4 flex gap-4 border-t border-slate-100">
                            <Button onClick={() => setIsLeaveModalOpen(false)} variant="secondary" className="flex-1 justify-center">Cancel</Button>
                            <Button onClick={() => {}} variant="primary" className="flex-1 justify-center bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200">Submit Request</Button>
                        </div>
                    </form>
                </div>
            </div>
         )}
      </div>
    );
  };

// --- App Component ---

const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [guards, setGuards] = useState<Guard[]>(INITIAL_GUARDS);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [newNotifMessage, setNewNotifMessage] = useState("");
  const notifRef = useRef<HTMLDivElement>(null);

  // Guard Modal State
  const [isGuardModalOpen, setIsGuardModalOpen] = useState(false);
  const [editingGuard, setEditingGuard] = useState<Guard | null>(null);
  
  const aiClient = null; 

  const handleAddGuard = (newGuard: Guard) => {
    setGuards(prev => [...prev, newGuard]);
    setIsGuardModalOpen(false);
  };
  
  const handleUpdateGuard = (updatedGuard: Guard) => {
    setGuards(prev => prev.map(g => g.id === updatedGuard.id ? updatedGuard : g));
    setIsGuardModalOpen(false);
  };
  
  const openAddGuardModal = () => {
    setEditingGuard(null);
    setIsGuardModalOpen(true);
  };

  const openEditGuardModal = (guard: Guard) => {
    setEditingGuard(guard);
    setIsGuardModalOpen(true);
  };

  const handleDeleteGuard = (id: string) => setGuards(prev => prev.filter(g => g.id !== id));
  
  const handleAddLeave = (newLeave: LeaveRequest) => setLeaves(prev => [...prev, newLeave]);
  const handleUpdateLeave = (id: string, status: "Approved" | "Rejected") => setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));

  const handleScatter = () => {
    setGuards(prev => prev.map(g => ({
      ...g,
      lat: g.lat + (Math.random() - 0.5) * 0.01,
      lng: g.lng + (Math.random() - 0.5) * 0.01,
      battery: Math.max(10, g.battery - Math.floor(Math.random() * 5))
    })));
  };

  const addNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotifMessage.trim()) return;
    const newNotif: AppNotification = {
      id: `n${Date.now()}`,
      title: 'Broadcast Message',
      message: newNotifMessage,
      time: 'Just now',
      read: false,
      type: 'info'
    };
    setNotifications(prev => [newNotif, ...prev]);
    setNewNotifMessage("");
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Close mobile menu when switching tabs
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/50 z-30 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col shadow-2xl lg:shadow-xl lg:shadow-slate-200/50 lg:relative lg:translate-x-0 transition-transform duration-300 ease-out transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Shield className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg tracking-tight">SECUREOPS</h1>
              <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full w-fit">AI Command</div>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 md:p-5 space-y-1.5 overflow-y-auto custom-scrollbar">
           {[
             { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
             { id: 'logs', icon: FileText, label: 'Daily Logs' },
             { id: 'personnel', icon: Users, label: 'Personnel' },
             { id: 'operations', icon: MapIcon, label: 'Live Ops' },
             { id: 'payroll', icon: Banknote, label: 'Payroll' },
             { id: 'blueprint', icon: GitMerge, label: 'Blueprint' },
             { id: 'admin', icon: UserCog, label: 'Admin Panel' },
             { id: 'intelligence', icon: BrainCircuit, label: 'Intelligence' },
           ].map(item => (
             <button
               key={item.id}
               onClick={() => handleTabChange(item.id)}
               className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 group font-medium text-sm ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
             >
               <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
               <span>{item.label}</span>
               {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
             </button>
           ))}
        </nav>
        
        <div className="p-4 md:p-5">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
               <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">System Health</span>
               <span className="flex h-2.5 w-2.5 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
               </span>
            </div>
            <div className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[98%] rounded-full"></div>
                </div>
                98%
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50 w-full min-w-0">
         {/* Top Bar */}
         <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0">
            <div className="flex items-center gap-4">
               <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
               >
                  <Menu className="w-6 h-6" />
               </button>
               <div className="flex items-center gap-2 text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm hidden sm:flex">
                 <Clock className="w-4 h-4" />
                 <span className="text-xs font-mono font-medium">{new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
               </div>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
               {/* Notification Bell with Dropdown */}
               <div className="relative" ref={notifRef}>
                 <button 
                   onClick={() => setIsNotifOpen(!isNotifOpen)}
                   className={`p-2.5 rounded-full relative transition-all ${isNotifOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                 >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>}
                 </button>

                 {isNotifOpen && (
                   <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><BellRing className="w-4 h-4" /> Notifications</h3>
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>
                      </div>
                      
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                         {notifications.length === 0 ? (
                           <div className="p-8 text-center text-slate-400 text-sm">No new notifications</div>
                         ) : (
                           notifications.map(n => (
                             <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 relative group">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'alert' ? 'bg-rose-500' : (n.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500')}`}></div>
                                <div className="flex-1">
                                   <div className="flex justify-between items-start mb-1">
                                     <span className="font-bold text-sm text-slate-800">{n.title}</span>
                                     <span className="text-[10px] text-slate-400">{n.time}</span>
                                   </div>
                                   <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                                </div>
                                <button 
                                  onClick={() => dismissNotification(n.id)}
                                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-all"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                             </div>
                           ))
                         )}
                      </div>

                      <div className="p-3 bg-slate-50 border-t border-slate-100">
                         <form onSubmit={addNotification} className="flex gap-2">
                            <input 
                              type="text" 
                              value={newNotifMessage}
                              onChange={(e) => setNewNotifMessage(e.target.value)}
                              placeholder="Broadcast alert..." 
                              className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                            />
                            <button type="submit" className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                               <Megaphone className="w-3.5 h-3.5" />
                            </button>
                         </form>
                      </div>
                   </div>
                 )}
               </div>

               <div className="flex items-center gap-3 md:gap-4 pl-4 md:pl-6 border-l border-slate-100">
                  <div className="text-right hidden md:block leading-tight">
                     <div className="text-sm font-bold text-slate-800">Commander Seth</div>
                     <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Admin Access</div>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-100 border-2 border-white shadow-md overflow-hidden p-0.5">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Seth" className="w-full h-full object-cover rounded-full" />
                  </div>
               </div>
            </div>
         </header>

         {/* Content Viewport */}
         <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 relative z-0 scroll-smooth">
            {activeTab === 'dashboard' && <DashboardView aiClient={aiClient} guards={guards} />}
            {activeTab === 'personnel' && <PersonnelView guards={guards} onEdit={openEditGuardModal} />}
            {activeTab === 'logs' && <DailyLogsView />}
            {activeTab === 'operations' && <OperationsView guards={guards} onScatter={handleScatter} />}
            {activeTab === 'payroll' && <PayrollView guards={guards} />}
            {activeTab === 'blueprint' && <WorkflowBlueprintView />}
            {activeTab === 'admin' && <AdminView guards={guards} onAdd={openAddGuardModal} onEdit={openEditGuardModal} onDelete={handleDeleteGuard} leaves={leaves} onAddLeave={handleAddLeave} onUpdateLeave={handleUpdateLeave} />}
            {activeTab === 'intelligence' && <ClientIntelligenceView aiClient={aiClient} />}
         </main>
      </div>

      {/* Global Guard Modal */}
      <GuardFormModal 
        isOpen={isGuardModalOpen} 
        onClose={() => setIsGuardModalOpen(false)} 
        initialData={editingGuard} 
        onSubmit={editingGuard ? handleUpdateGuard : handleAddGuard} 
      />

    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
