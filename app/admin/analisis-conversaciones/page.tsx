"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Search,
  Lock,
  LogOut,
  Loader2,
  Sparkles,
  Filter,
  ChevronRight,
  MessageSquareText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type AnalysisRow = {
  id: string;
  conversation_id: number;
  intent: string;
  resolved: boolean;
  issues: string[] | null;
  summary: string;
  created_at: string;
  phone_number?: string | null;
};

const INTENT_STYLES: Record<string, string> = {
  FACTURA: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-100",
  RECLAMO_CORTE: "bg-red-100 text-red-900 border-red-200 dark:bg-red-950/50 dark:text-red-100",
  NUEVO_SERVICIO: "bg-sky-100 text-sky-900 border-sky-200 dark:bg-sky-950/50 dark:text-sky-100",
  CONSULTA_GENERAL: "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-100",
  OTRO: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200",
};

const ISSUE_STYLES =
  "text-xs font-medium bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200";

export default function AnalisisConversacionesPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [rows, setRows] = useState<AnalysisRow[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  const [search, setSearch] = useState("");
  const [filterResolved, setFilterResolved] = useState<"all" | "yes" | "no">(
    "all"
  );
  const [filterIntent, setFilterIntent] = useState<string>("all");

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/conversation-analysis/check-auth");
      const data = await res.json();
      setAuthenticated(!!data.authenticated);
    } catch {
      setAuthenticated(false);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  const loadData = useCallback(async () => {
    setDataLoading(true);
    setDataError("");
    try {
      const res = await fetch("/api/admin/conversation-analysis");
      if (res.status === 401) {
        setAuthenticated(false);
        setRows([]);
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        setDataError(json.error || "No se pudieron cargar los datos");
        return;
      }
      setRows(json.rows ?? []);
    } catch {
      setDataError("Error de red al cargar el análisis");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated, loadData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await fetch("/api/admin/conversation-analysis/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!data.success) {
        setAuthError(data.error || "Contraseña incorrecta");
        return;
      }
      setAuthenticated(true);
      setPassword("");
    } catch {
      setAuthError("Error al iniciar sesión");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/conversation-analysis/auth", { method: "DELETE" });
    setAuthenticated(false);
    setRows([]);
  };

  const intents = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => s.add(r.intent || "OTRO"));
    return ["all", ...Array.from(s).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filterResolved === "yes" && !r.resolved) return false;
      if (filterResolved === "no" && r.resolved) return false;
      if (filterIntent !== "all" && r.intent !== filterIntent) return false;
      if (!q) return true;
      const hay = [
        r.summary,
        r.intent,
        String(r.conversation_id),
        r.phone_number ?? "",
        ...(r.issues ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, search, filterResolved, filterIntent]);

  const stats = useMemo(() => {
    const total = rows.length;
    const ok = rows.filter((r) => r.resolved).length;
    return {
      total,
      resolved: ok,
      unresolved: total - ok,
      rate: total ? Math.round((ok / total) * 100) : 0,
    };
  }, [rows]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Loader2 className="h-10 w-10 animate-spin text-coop-green" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none flex items-center justify-center">
          <Image
            src="/images/logocoopnuevo.png"
            alt=""
            width={480}
            height={480}
            className="object-contain"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-violet-500 via-coop-green to-cyan-500" />
            <CardHeader className="text-center space-y-2 pb-2">
              <div className="flex justify-center mb-2">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-600 shadow-lg">
                  <BrainCircuit className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                Análisis de conversaciones
              </CardTitle>
              <CardDescription>
                Panel interno — ingresá la contraseña de administración
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11"
                    autoComplete="current-password"
                  />
                </div>
                {authError && (
                  <p className="text-sm text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-950/40 py-2 rounded-lg">
                    {authError}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={authLoading}
                  className="w-full h-11 bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-95 text-white"
                >
                  {authLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Ingresar"
                  )}
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/admin" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Volver al panel admin
                  </Link>
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-violet-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <header className="sticky top-0 z-40 border-b border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Link>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-600 shadow-md">
                <BrainCircuit className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  Análisis de conversaciones
                </h1>
                <p className="text-xs text-muted-foreground">
                  Resultados del análisis automático (IA)
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 shrink-0"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-violet-50/50 dark:from-gray-900 dark:to-violet-950/20 overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                <MessageSquareText className="h-4 w-4" />
                Registros
              </CardDescription>
              <CardTitle className="text-3xl font-bold tabular-nums">
                {stats.total}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Filas en{" "}
              <code className="text-xs bg-muted px-1 rounded">conversation_analysis</code>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/20">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Resueltos
              </CardDescription>
              <CardTitle className="text-3xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                {stats.resolved}
                <span className="text-lg font-medium text-muted-foreground ml-2">
                  ({stats.rate}%)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Marcados como resueltos por el análisis
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-rose-50/50 dark:from-gray-900 dark:to-rose-950/20">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <XCircle className="h-4 w-4" />
                Sin resolver
              </CardDescription>
              <CardTitle className="text-3xl font-bold tabular-nums text-rose-700 dark:text-rose-400">
                {stats.unresolved}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Requieren revisión o mejora del bot
            </CardContent>
          </Card>
        </motion.div>

        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-violet-500 via-coop-green to-cyan-500" />
          <CardHeader className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  Tabla de análisis
                </CardTitle>
                <CardDescription>
                  Mostrando {filtered.length} de {rows.length} filas
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar en resumen, intent, teléfono, ID…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant={filterResolved === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterResolved("all")}
                    className="gap-1"
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Todos
                  </Button>
                  <Button
                    type="button"
                    variant={filterResolved === "yes" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterResolved("yes")}
                  >
                    Resueltos
                  </Button>
                  <Button
                    type="button"
                    variant={filterResolved === "no" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterResolved("no")}
                  >
                    No resueltos
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                Intención
              </span>
              {intents
                .filter((i) => i !== "all")
                .map((intent) => (
                  <Button
                    key={intent}
                    type="button"
                    size="sm"
                    variant={filterIntent === intent ? "secondary" : "ghost"}
                    className="h-7 text-xs"
                    onClick={() =>
                      setFilterIntent(filterIntent === intent ? "all" : intent)
                    }
                  >
                    {intent}
                  </Button>
                ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {dataLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
              </div>
            ) : dataError ? (
              <p className="text-center text-red-600 py-12 px-4">{dataError}</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No hay registros que coincidan con los filtros.
              </p>
            ) : (
              <>
                <div className="hidden lg:block">
                  <ScrollArea className="h-[min(70vh,720px)]">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b">
                          <TableHead className="w-[100px]">Fecha</TableHead>
                          <TableHead className="w-[90px]">Conv.</TableHead>
                          <TableHead>Teléfono / sesión</TableHead>
                          <TableHead>Intent</TableHead>
                          <TableHead className="w-[100px] text-center">
                            OK
                          </TableHead>
                          <TableHead>Issues</TableHead>
                          <TableHead className="min-w-[200px]">
                            Resumen
                          </TableHead>
                          <TableHead className="w-[70px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence initial={false}>
                          {filtered.map((row) => (
                            <TableRow
                              key={row.id}
                              className="group border-b border-gray-100 dark:border-gray-800"
                            >
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap align-top py-3">
                                {format(
                                  new Date(row.created_at),
                                  "dd MMM yyyy HH:mm",
                                  { locale: es }
                                )}
                              </TableCell>
                              <TableCell className="font-mono text-xs align-top py-3">
                                #{row.conversation_id}
                              </TableCell>
                              <TableCell className="text-sm align-top py-3 max-w-[160px] break-all">
                                {row.phone_number ?? "—"}
                              </TableCell>
                              <TableCell className="align-top py-3">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "font-normal",
                                    INTENT_STYLES[row.intent] ??
                                      INTENT_STYLES.OTRO
                                  )}
                                >
                                  {row.intent}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center align-top py-3">
                                {row.resolved ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-rose-500 mx-auto" />
                                )}
                              </TableCell>
                              <TableCell className="align-top py-3">
                                <div className="flex flex-wrap gap-1 max-w-[220px]">
                                  {(row.issues ?? []).length === 0 ? (
                                    <span className="text-xs text-muted-foreground">
                                      —
                                    </span>
                                  ) : (
                                    (row.issues ?? []).map((issue) => (
                                      <Badge
                                        key={issue}
                                        variant="secondary"
                                        className={ISSUE_STYLES}
                                      >
                                        {issue}
                                      </Badge>
                                    ))
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground align-top py-3 max-w-md">
                                <p className="line-clamp-2">{row.summary}</p>
                              </TableCell>
                              <TableCell className="align-top py-3">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="opacity-70 group-hover:opacity-100"
                                    >
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        Análisis #{row.conversation_id}
                                      </DialogTitle>
                                    </DialogHeader>
                                    <DetailBody row={row} />
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>

                <div className="lg:hidden divide-y divide-border">
                  {filtered.map((row) => (
                    <motion.div
                      key={row.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 space-y-3 bg-card/50"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <Badge
                          className={cn(
                            INTENT_STYLES[row.intent] ?? INTENT_STYLES.OTRO
                          )}
                        >
                          {row.intent}
                        </Badge>
                        {row.resolved ? (
                          <span className="text-xs text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Resuelto
                          </span>
                        ) : (
                          <span className="text-xs text-rose-600 flex items-center gap-1">
                            <XCircle className="h-4 w-4" /> No resuelto
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(row.created_at),
                          "dd/MM/yyyy HH:mm",
                          { locale: es }
                        )}{" "}
                        · Conv. #{row.conversation_id}
                      </p>
                      <p className="text-sm break-all">
                        <span className="text-muted-foreground text-xs">
                          Contacto:{" "}
                        </span>
                        {row.phone_number ?? "—"}
                      </p>
                      <p className="text-sm">{row.summary}</p>
                      <div className="flex flex-wrap gap-1">
                        {(row.issues ?? []).map((issue) => (
                          <Badge
                            key={issue}
                            variant="secondary"
                            className={ISSUE_STYLES}
                          >
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function DetailBody({ row }: { row: AnalysisRow }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Creado</span>
          <p className="font-medium">
            {format(new Date(row.created_at), "PPpp", { locale: es })}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Conversación ID</span>
          <p className="font-mono font-medium">{row.conversation_id}</p>
        </div>
      </div>
      <div>
        <span className="text-muted-foreground text-xs">Teléfono / sesión</span>
        <p className="break-all">{row.phone_number ?? "—"}</p>
      </div>
      <div>
        <span className="text-muted-foreground text-xs">Resumen</span>
        <p className="mt-1 leading-relaxed">{row.summary}</p>
      </div>
      <div>
        <span className="text-muted-foreground text-xs">Issues detectados</span>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {(row.issues ?? []).length === 0 ? (
            <span className="text-muted-foreground">Ninguno</span>
          ) : (
            (row.issues ?? []).map((issue) => (
              <Badge key={issue} variant="secondary" className={ISSUE_STYLES}>
                {issue}
              </Badge>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
