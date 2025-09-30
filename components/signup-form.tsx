"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useTranslations } from "next-intl"

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [signupComplete, setSignupComplete] = useState(false)
  const supabase = createClient()
  const t = useTranslations("auth")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Submit registration request
    const { data, error } = await supabase
      .rpc('submit_registration_request', {
        p_email: email,
        p_company_name: companyName,
        p_phone: phone
      })

    if (error || !data?.success) {
      setError(data?.message || error?.message || t("signupRequestError"))
      setLoading(false)
    } else {
      setSignupComplete(true)
    }
  }

  if (signupComplete) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">{t("signupSuccessTitle")}</CardTitle>
            <CardDescription className="mt-3">
              {t("signupSuccessSubtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-sm text-muted-foreground">
              {t("signupSuccessBody")}
            </p>
            <p className="mb-6 text-sm text-muted-foreground">
              {t.rich("signupSuccessTimeline", {
                email,
                strong: (chunks) => <span className="font-medium">{chunks}</span>,
              })}
            </p>
            <Button asChild className="w-full">
              <Link href="/login">{t("signupSuccessReturn")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("signupRequestTitle")}</CardTitle>
          <CardDescription>
            {t("signupRequestDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="company">{t("companyName")}</Label>
                <Input
                  id="company"
                  type="text"
                  placeholder={t("companyNamePlaceholder")}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t("businessEmail")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("businessEmailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  {t("businessEmailHelper")}
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">{t("phoneNumber")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t("phoneNumberPlaceholder")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("signupRequestSubmitting") : t("signupRequestCta")}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t("alreadyHaveAccount")} {" "}
              <Link href="/login" className="underline underline-offset-4">
                {t("login")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
