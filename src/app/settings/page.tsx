"use client";

import { FormEvent, useState } from "react";
import { Loader2, LogOut, Palette, UserRound } from "lucide-react";
import { ThemeSwitcher } from "@/app/ThemeSwitcher";
import { DashboardViewport } from "@/components/dashboard-viewport";
import { MenuPageHeader } from "@/components/menu-page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorState, FieldError, LoadingState, RetryButton } from "@/components/ui/app-state";
import { Input } from "@/components/ui/input";
import { useCurrentUser, useLogout, useUpdateCurrentUser } from "@/hooks/useCurrentUser";
import type { CurrentUser } from "@/types/CurrentUser";

const MAX_NAME_LENGTH = 120;

function ProfileCard({ user }: { user: CurrentUser }) {
  const updateCurrentUser = useUpdateCurrentUser();
  const [name, setName] = useState(user.name ?? "");
  const [nameError, setNameError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = name.trim();

    if (normalizedName.length > MAX_NAME_LENGTH) {
      setNameError(`O nome deve ter no máximo ${MAX_NAME_LENGTH} caracteres.`);
      return;
    }

    setNameError("");
    updateCurrentUser.mutate({ name });
  };

  return (
    <Card className="lg:row-span-2">
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-secondary text-text-secondary">
                  <UserRound className="size-[18px]" aria-hidden="true" />
                </span>
                <div>
                  <CardTitle>Perfil</CardTitle>
                  <CardDescription className="mt-1">
                    Atualize como seu nome aparece no LifeUp.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="grid gap-4">
                <div className="grid gap-1.5">
                  <label className="text-[13px] font-medium" htmlFor="settings-name">
                    Nome
                  </label>
                  <Input
                    aria-describedby={nameError ? "settings-name-error" : "settings-name-help"}
                    aria-invalid={Boolean(nameError)}
                    autoComplete="name"
                    disabled={updateCurrentUser.isPending}
                    id="settings-name"
                    maxLength={MAX_NAME_LENGTH + 1}
                    onChange={(event) => {
                      setName(event.target.value);
                      if (nameError) setNameError("");
                    }}
                    placeholder="Como você prefere ser chamado"
                    value={name}
                  />
                  <FieldError id="settings-name-error">{nameError}</FieldError>
                  {!nameError ? (
                    <p className="text-xs text-text-tertiary" id="settings-name-help">
                      Deixe em branco para usar o início do seu e-mail na saudação.
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-1.5">
                  <label className="text-[13px] font-medium" htmlFor="settings-email">
                    E-mail
                  </label>
                  <Input disabled id="settings-email" type="email" value={user.email} />
                  <p className="text-xs text-text-tertiary">
                    O e-mail é usado para entrar e não pode ser alterado aqui.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="mt-5 border-t">
                <Button disabled={updateCurrentUser.isPending} type="submit">
                  {updateCurrentUser.isPending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  {updateCurrentUser.isPending ? "Salvando" : "Salvar alterações"}
                </Button>
              </CardFooter>
            </form>
    </Card>
  );
}

export default function SettingsPage() {
  const currentUser = useCurrentUser();
  const logout = useLogout();

  return (
    <DashboardViewport
      className="w-full max-w-none"
      header={<MenuPageHeader eyebrow="Preferências da conta" title="Configurações" />}
    >
      {currentUser.isPending ? (
        <LoadingState className="min-h-48" title="Carregando suas configurações" />
      ) : currentUser.isError || !currentUser.data ? (
        <ErrorState
          action={<RetryButton onClick={() => void currentUser.refetch()} />}
          description="Confira sua conexão e tente carregar os dados novamente."
          title="Não foi possível carregar suas configurações"
        />
      ) : (
        <div className="grid gap-4 pb-3 lg:grid-cols-2">
          <ProfileCard
            key={`${currentUser.data.id}-${currentUser.data.name ?? ""}`}
            user={currentUser.data}
          />

          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-secondary text-text-secondary">
                  <Palette className="size-[18px]" aria-hidden="true" />
                </span>
                <div>
                  <CardTitle>Aparência</CardTitle>
                  <CardDescription className="mt-1">
                    Escolha o tema usado nesta interface.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ThemeSwitcher />
              <p className="mt-3 text-xs text-text-tertiary">
                Sua escolha fica salva neste navegador.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sessão</CardTitle>
              <CardDescription>Encerre o acesso do LifeUp neste navegador.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                disabled={logout.isPending}
                onClick={() => logout.mutate()}
                type="button"
                variant="outline"
              >
                {logout.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <LogOut className="size-4" aria-hidden="true" />
                )}
                {logout.isPending ? "Saindo" : "Sair da conta"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardViewport>
  );
}
