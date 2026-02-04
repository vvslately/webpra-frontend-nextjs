"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SidebarContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  collapsible: "offcanvas" | "icon" | "none";
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  return ctx ?? { open: true, setOpen: () => {}, collapsible: "none" as const };
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    collapsible?: "offcanvas" | "icon" | "none";
  }
>(({ defaultOpen = true, open: controlledOpen, onOpenChange, collapsible = "none", className, children, ...props }, ref) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = React.useCallback(
    (v: boolean) => {
      onOpenChange?.(v);
      if (controlledOpen === undefined) setUncontrolledOpen(v);
    },
    [onOpenChange, controlledOpen]
  );
  return (
    <SidebarContext.Provider value={{ open, setOpen, collapsible }}>
      <div ref={ref} className={cn("flex", className)} data-sidebar="" {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
});
SidebarProvider.displayName = "SidebarProvider";

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { collapsible?: "offcanvas" | "icon" | "none" }
>(({ className, collapsible = "none", ...props }, ref) => (
  <aside
    ref={ref}
    className={cn(
      "group flex h-full w-[--sidebar-width] min-w-[--sidebar-width] flex-col border-r border-border bg-background transition-[width] duration-200 ease-linear",
      "data-[collapsible=icon]:w-[--sidebar-width-icon] data-[collapsible=icon]:min-w-[--sidebar-width-icon]",
      "[--sidebar-width:16rem] [--sidebar-width-icon:3rem]",
      className
    )}
    data-collapsible={collapsible}
    {...props}
  />
));
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-2 p-2", className)} data-sidebar-header="" {...props} />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-1 flex-col gap-2 overflow-auto p-2", className)} data-sidebar-content="" {...props} />
));
SidebarContent.displayName = "SidebarContent";

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("group flex flex-col gap-1", className)} data-sidebar-group="" {...props} />
));
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)} data-sidebar-group-label="" {...props} />
));
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1", className)} data-sidebar-group-content="" {...props} />
));
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("flex flex-col gap-1", className)} data-sidebar-menu="" {...props} />
));
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("list-none", className)} data-sidebar-menu-item="" {...props} />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string;
  }
>(({ className, asChild, isActive, tooltip, children, ...props }, ref) => {
  const classes = cn(
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
    "hover:bg-muted hover:text-foreground",
    "data-[active=true]:bg-muted data-[active=true]:text-foreground",
    "data-[collapsible=icon]:justify-center data-[collapsible=icon]:px-2",
    className
  );
  if (asChild && React.Children.count(children) === 1 && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ className?: string; "data-active"?: boolean; title?: string }>, {
      className: cn(classes, (children as React.ReactElement<{ className?: string }>).props.className),
      "data-active": isActive,
      title: tooltip,
    });
  }
  return (
    <button
      ref={ref}
      type="button"
      className={classes}
      data-active={isActive}
      title={tooltip}
      {...props}
    >
      {children}
    </button>
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <main
    ref={ref}
    className={cn(
      "relative flex flex-1 flex-col min-w-0",
      className
    )}
    {...props}
  />
));
SidebarInset.displayName = "SidebarInset";

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { setOpen, open } = useSidebar();
  return (
    <button
      ref={ref}
      type="button"
      aria-label="Toggle sidebar"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background hover:bg-muted hover:text-foreground",
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    />
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
};
