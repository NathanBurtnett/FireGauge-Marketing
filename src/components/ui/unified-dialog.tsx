import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Unified Dialog Component for FireGauge Marketing
 * 
 * A comprehensive dialog component that provides consistent styling
 * and behavior across the marketing site, built on Radix UI primitives.
 */

const UnifiedDialog = DialogPrimitive.Root

const UnifiedDialogTrigger = DialogPrimitive.Trigger

const UnifiedDialogPortal = DialogPrimitive.Portal

const UnifiedDialogClose = DialogPrimitive.Close

const UnifiedDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
UnifiedDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface UnifiedDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  mobileFullscreen?: boolean
}

const UnifiedDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  UnifiedDialogContentProps
>(({ className, children, size = 'md', variant = 'default', mobileFullscreen = true, ...props }, ref) => {
  const getSizeClasses = () => {
    const baseClasses = "grid w-full gap-4 border bg-background p-6 shadow-lg duration-200"
    
    switch (size) {
      case 'xs':
        return `${baseClasses} max-w-xs`
      case 'sm':
        return `${baseClasses} max-w-sm`
      case 'md':
        return `${baseClasses} max-w-lg`
      case 'lg':
        return `${baseClasses} max-w-2xl`
      case 'xl':
        return `${baseClasses} max-w-4xl`
      case 'full':
        return `${baseClasses} max-w-none w-screen h-screen`
      default:
        return `${baseClasses} max-w-lg`
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'border-blue-200 dark:border-blue-800'
      case 'success':
        return 'border-green-200 dark:border-green-800'
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800'
      case 'danger':
        return 'border-red-200 dark:border-red-800'
      case 'info':
        return 'border-blue-200 dark:border-blue-800'
      default:
        return ''
    }
  }

  const getMobileClasses = () => {
    if (mobileFullscreen) {
      return 'sm:rounded-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] sm:max-w-none sm:w-auto sm:h-auto'
    }
    return 'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] sm:rounded-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]'
  }

  return (
    <UnifiedDialogPortal>
      <UnifiedDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          getSizeClasses(),
          getVariantClasses(),
          getMobileClasses(),
          // Mobile fullscreen when enabled
          mobileFullscreen && "max-sm:w-screen max-sm:h-screen max-sm:rounded-none max-sm:border-0",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </UnifiedDialogPortal>
  )
})
UnifiedDialogContent.displayName = DialogPrimitive.Content.displayName

interface UnifiedDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  showIcon?: boolean
}

const UnifiedDialogHeader = ({
  className,
  variant = 'default',
  showIcon = true,
  children,
  ...props
}: UnifiedDialogHeaderProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'border-b border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
      case 'success':
        return 'border-b border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
      case 'warning':
        return 'border-b border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
      case 'danger':
        return 'border-b border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
      case 'info':
        return 'border-b border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
      default:
        return 'border-b'
    }
  }

  const getIcon = () => {
    if (!showIcon) return null
    
    const iconClasses = "h-5 w-5 flex-shrink-0"
    
    switch (variant) {
      case 'success':
        return <CheckCircle className={cn(iconClasses, "text-green-600 dark:text-green-400")} />
      case 'warning':
        return <AlertTriangle className={cn(iconClasses, "text-yellow-600 dark:text-yellow-400")} />
      case 'danger':
        return <AlertCircle className={cn(iconClasses, "text-red-600 dark:text-red-400")} />
      case 'info':
      case 'primary':
        return <Info className={cn(iconClasses, "text-blue-600 dark:text-blue-400")} />
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-6 py-4 -mx-6 -mt-6 mb-4",
        getVariantClasses(),
        className
      )}
      {...props}
    >
      {getIcon()}
      <div className="flex flex-col space-y-1.5 text-center sm:text-left flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}
UnifiedDialogHeader.displayName = "UnifiedDialogHeader"

const UnifiedDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 pt-4 -mx-6 -mb-6 px-6 pb-6 border-t bg-muted/20",
      className
    )}
    {...props}
  />
)
UnifiedDialogFooter.displayName = "UnifiedDialogFooter"

const UnifiedDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
UnifiedDialogTitle.displayName = DialogPrimitive.Title.displayName

const UnifiedDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
UnifiedDialogDescription.displayName = DialogPrimitive.Description.displayName

const UnifiedDialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex-1 overflow-y-auto overscroll-contain",
      className
    )}
    {...props}
  />
)
UnifiedDialogBody.displayName = "UnifiedDialogBody"

export {
  UnifiedDialog,
  UnifiedDialogPortal,
  UnifiedDialogOverlay,
  UnifiedDialogTrigger,
  UnifiedDialogClose,
  UnifiedDialogContent,
  UnifiedDialogHeader,
  UnifiedDialogFooter,
  UnifiedDialogTitle,
  UnifiedDialogDescription,
  UnifiedDialogBody,
} 