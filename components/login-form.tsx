"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { useAuth } from "@/components/providers/auth-provider"
import { LoginGradientPlaceholder } from "@/components/login/login-gradient-placeholder"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()
  const t = useTranslations()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam === "account_disabled") {
      setError(t("auth.accountDisabled"))
    }
  }, [searchParams, t])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/admin")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 p-6 md:p-8"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">{t("auth.loginTitle")}</h1>
              <p className="text-balance text-muted-foreground">
                {t("auth.loginDescription")}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link
                  href="/reset-password"
                  className="ml-auto text-sm underline-offset-2 hover:underline"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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
              {loading ? t("auth.loggingIn") : t("auth.login")}
            </Button>
            <div className="text-center text-sm">
              {t("auth.dontHaveAccount")} {" "}
              <Link href="/signup" className="underline underline-offset-4">
                {t("auth.signup")}
              </Link>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <LoginGradientPlaceholder className="absolute inset-0" />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <Link href="#">Terms of Service</Link>{" "}
        and <Link href="#">Privacy Policy</Link>.
      </div>
    </div>
  )
}
