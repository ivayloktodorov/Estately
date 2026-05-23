import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as authService from '@/services/auth.service';
import { getStoredSession } from '@/services/storage.service';
import type { AuthSession, LoginInput, RegisterInput } from '@/types/auth';

const authSessionQueryKey = ['auth', 'session'] as const;

export function useAuthSession() {
  return useQuery<AuthSession | null>({
    queryKey: authSessionQueryKey,
    queryFn: getStoredSession,
    initialData: null,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (session) => {
      queryClient.setQueryData(authSessionQueryKey, session);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
    onSuccess: (session) => {
      queryClient.setQueryData(authSessionQueryKey, session);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(authSessionQueryKey, null);
    },
  });
}
