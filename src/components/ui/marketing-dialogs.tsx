import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  UnifiedDialog,
  UnifiedDialogContent,
  UnifiedDialogHeader,
  UnifiedDialogFooter,
  UnifiedDialogTitle,
  UnifiedDialogDescription,
  UnifiedDialogBody,
  UnifiedDialogClose,
} from "./unified-dialog"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  loading?: boolean
  onConfirm: () => void | Promise<void>
}

/**
 * Confirmation Dialog for Marketing Site
 * 
 * Consistent confirmation dialog with proper loading states
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = 'danger',
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error('Confirmation action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'destructive'
      case 'warning':
        return 'destructive'
      case 'success':
        return 'default'
      case 'primary':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <UnifiedDialog open={open} onOpenChange={onOpenChange}>
      <UnifiedDialogContent size="sm" variant={variant}>
        <UnifiedDialogHeader variant={variant}>
          <UnifiedDialogTitle>{title}</UnifiedDialogTitle>
          <UnifiedDialogDescription>{description}</UnifiedDialogDescription>
        </UnifiedDialogHeader>

        <UnifiedDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={getButtonVariant()}
            onClick={handleConfirm}
            disabled={isLoading || loading}
          >
            {(isLoading || loading) && (
              <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin mr-2" />
            )}
            {confirmText}
          </Button>
        </UnifiedDialogFooter>
      </UnifiedDialogContent>
    </UnifiedDialog>
  )
}

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  buttonText?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  autoClose?: boolean
  autoCloseDelay?: number
}

/**
 * Alert Dialog for Marketing Site
 * 
 * Simple alert dialog with optional auto-close
 */
export function AlertDialog({
  open,
  onOpenChange,
  title = "Alert",
  description = "",
  buttonText = "OK",
  variant = 'info',
  autoClose = false,
  autoCloseDelay = 3000,
}: AlertDialogProps) {
  React.useEffect(() => {
    if (open && autoClose) {
      const timer = setTimeout(() => {
        onOpenChange(false)
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [open, autoClose, autoCloseDelay, onOpenChange])

  return (
    <UnifiedDialog open={open} onOpenChange={onOpenChange}>
      <UnifiedDialogContent size="sm" variant={variant}>
        <UnifiedDialogHeader variant={variant}>
          <UnifiedDialogTitle>{title}</UnifiedDialogTitle>
          {description && (
            <UnifiedDialogDescription>{description}</UnifiedDialogDescription>
          )}
        </UnifiedDialogHeader>

        <UnifiedDialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            {buttonText}
          </Button>
        </UnifiedDialogFooter>
      </UnifiedDialogContent>
    </UnifiedDialog>
  )
}

interface LoadingDialogProps {
  open: boolean
  title?: string
  description?: string
  progress?: number
  showProgress?: boolean
  onCancel?: () => void
  cancelText?: string
}

/**
 * Loading Dialog for Marketing Site
 * 
 * Loading dialog with optional progress bar and cancel action
 */
export function LoadingDialog({
  open,
  title = "Loading...",
  description = "Please wait while we process your request.",
  progress = 0,
  showProgress = false,
  onCancel,
  cancelText = "Cancel",
}: LoadingDialogProps) {
  return (
    <UnifiedDialog open={open} onOpenChange={() => {}}>
      <UnifiedDialogContent size="sm" variant="default">
        <UnifiedDialogHeader variant="default" showIcon={false}>
          <UnifiedDialogTitle>{title}</UnifiedDialogTitle>
          <UnifiedDialogDescription>{description}</UnifiedDialogDescription>
        </UnifiedDialogHeader>

        <UnifiedDialogBody>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-8 h-8 border-4 border-primary border-r-transparent rounded-full animate-spin" />
            
            {showProgress && (
              <div className="w-full">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </UnifiedDialogBody>

        {onCancel && (
          <UnifiedDialogFooter>
            <Button variant="outline" onClick={onCancel}>
              {cancelText}
            </Button>
          </UnifiedDialogFooter>
        )}
      </UnifiedDialogContent>
    </UnifiedDialog>
  )
}

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  submitText?: string
  cancelText?: string
  loading?: boolean
  disabled?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  onSubmit: (e: React.FormEvent) => void | Promise<void>
}

/**
 * Form Dialog for Marketing Site
 * 
 * Dialog wrapper for forms with consistent styling and behavior
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  submitText = "Save",
  cancelText = "Cancel",
  loading = false,
  disabled = false,
  size = 'md',
  variant = 'default',
  onSubmit,
}: FormDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading || loading || disabled) return

    setIsLoading(true)
    try {
      await onSubmit(e)
    } catch (error) {
      console.error('Form submission failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <UnifiedDialog open={open} onOpenChange={onOpenChange}>
      <UnifiedDialogContent size={size} variant={variant}>
        <UnifiedDialogHeader variant={variant}>
          <UnifiedDialogTitle>{title}</UnifiedDialogTitle>
          {description && (
            <UnifiedDialogDescription>{description}</UnifiedDialogDescription>
          )}
        </UnifiedDialogHeader>

        <UnifiedDialogBody>
          <form id="dialog-form" onSubmit={handleSubmit}>
            {children}
          </form>
        </UnifiedDialogBody>

        <UnifiedDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || loading}
            type="button"
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            form="dialog-form"
            disabled={isLoading || loading || disabled}
          >
            {(isLoading || loading) && (
              <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin mr-2" />
            )}
            {submitText}
          </Button>
        </UnifiedDialogFooter>
      </UnifiedDialogContent>
    </UnifiedDialog>
  )
}

interface NewsletterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubscribe: (email: string) => Promise<void>
}

/**
 * Newsletter Subscription Dialog
 * 
 * Specialized dialog for newsletter subscriptions
 */
export function NewsletterDialog({
  open,
  onOpenChange,
  onSubscribe,
}: NewsletterDialogProps) {
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError("Email is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await onSubscribe(email)
      onOpenChange(false)
      setEmail("")
    } catch (err) {
      setError("Failed to subscribe. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <UnifiedDialog open={open} onOpenChange={onOpenChange}>
      <UnifiedDialogContent size="md" variant="primary">
        <UnifiedDialogHeader variant="primary">
          <UnifiedDialogTitle>Stay Updated</UnifiedDialogTitle>
          <UnifiedDialogDescription>
            Get the latest FireGauge updates, tips, and industry insights delivered to your inbox.
          </UnifiedDialogDescription>
        </UnifiedDialogHeader>

        <UnifiedDialogBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
              )}
            </div>
          </form>
        </UnifiedDialogBody>

        <UnifiedDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !email.trim()}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin mr-2" />
            )}
            Subscribe
          </Button>
        </UnifiedDialogFooter>
      </UnifiedDialogContent>
    </UnifiedDialog>
  )
}

interface FeaturePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  image?: string
  features: string[]
  onTryDemo?: () => void
  onLearnMore?: () => void
}

/**
 * Feature Preview Dialog
 * 
 * Showcase new features with images and lists
 */
export function FeaturePreviewDialog({
  open,
  onOpenChange,
  title,
  description,
  image,
  features,
  onTryDemo,
  onLearnMore,
}: FeaturePreviewDialogProps) {
  return (
    <UnifiedDialog open={open} onOpenChange={onOpenChange}>
      <UnifiedDialogContent size="lg" variant="primary">
        <UnifiedDialogHeader variant="primary">
          <UnifiedDialogTitle>{title}</UnifiedDialogTitle>
          {description && (
            <UnifiedDialogDescription>{description}</UnifiedDialogDescription>
          )}
        </UnifiedDialogHeader>

        <UnifiedDialogBody>
          <div className="space-y-6">
            {image && (
              <div className="w-full">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-3">Key Features:</h4>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </UnifiedDialogBody>

        <UnifiedDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {onLearnMore && (
            <Button variant="outline" onClick={onLearnMore}>
              Learn More
            </Button>
          )}
          {onTryDemo && (
            <Button onClick={onTryDemo}>
              Try Demo
            </Button>
          )}
        </UnifiedDialogFooter>
      </UnifiedDialogContent>
    </UnifiedDialog>
  )
} 