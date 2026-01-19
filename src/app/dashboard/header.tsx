import { SidebarTrigger } from "@/components/ui/sidebar";

interface Props {
    children?: React.ReactNode,
    title: string,
    description?: string
}

export default function Header({ children, title, description }: Props) {
  return (
    <header className="flex flex-wrap py-4 min-h-20 items-center justify-between gap-4 border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition" />
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </header>
  )
}