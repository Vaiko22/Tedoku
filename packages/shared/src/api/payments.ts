import { request } from './client';
import { endpoints as E } from './endpoints';
import * as M from './mocks/patient';
import * as P from './mocks/provider';
import type {
  BankTransferDetails,
  ChatMessage,
  Checkout,
  Consultation,
  ExternalWalletOption,
  NairaMethod,
  PaymentResult,
  RevealField,
  UsdcSource,
  Wallet,
} from '../types';

let simulateFailure = false;

export const paymentsApi = {
  createCheckout: (doctorId: string) =>
    request<Checkout>({ method: 'POST', path: E.payments.checkout, body: { doctorId } }, () => {
      const doctor = M.doctors.find((d) => d.id === doctorId) ?? M.doctors[0]!;
      return {
        id: 'chk_' + doctor.id,
        doctor,
        amountNaira: doctor.priceNaira,
        amountUsdc: 3.3,
        nairaPerUsdc: M.platformSettings.nairaPerUsdc,
        feeIncluded: true,
      };
    }),
  bankTransferDetails: (checkoutId: string) =>
    request<BankTransferDetails>({ path: E.payments.bankTransfer, params: { id: checkoutId } }, () => ({
      bank: '[Partner bank]',
      accountNumber: '0123456789',
      accountName: 'Tedoku Payments',
      expiresInMinutes: 29,
    })),
  ussdCode: (checkoutId: string, bank: string) =>
    request<{ code: string }>({ path: E.payments.ussdCode, params: { id: checkoutId }, query: { bank } }, () => ({ code: '*000*000#' })),
  /** PLACEHOLDER: call `simulateNextFailure()` to see the failure screen. */
  payNaira: (checkoutId: string, method: NairaMethod, details?: Record<string, string>) =>
    request<PaymentResult>({ method: 'POST', path: E.payments.payNaira, params: { id: checkoutId }, body: { method, ...details } }, async () => {
      await new Promise((r) => setTimeout(r, 1200));
      if (simulateFailure) {
        simulateFailure = false;
        return { status: 'failed', reason: 'Your bank did not approve the payment.' };
      }
      return { status: 'success', reference: 'TDK-48213', consultationId: 'c_luna' };
    }),
  payUsdc: (checkoutId: string, source: UsdcSource) =>
    request<PaymentResult>({ method: 'POST', path: E.payments.payUsdc, params: { id: checkoutId }, body: { source } }, async () => {
      await new Promise((r) => setTimeout(r, 1200));
      if (simulateFailure) {
        simulateFailure = false;
        return { status: 'failed', reason: 'The network did not confirm your payment in time.' };
      }
      return { status: 'success', reference: 'TDK-48213', consultationId: 'c_luna' };
    }),
  /** Only meaningful while placeholder data is on. */
  simulateNextFailure: () => {
    simulateFailure = true;
  },
};

export const walletApi = {
  me: () => request<Wallet>({ path: E.wallet.me }, () => M.wallet),
  externalOptions: () => request<ExternalWalletOption[]>({ path: E.wallet.externalOptions }, () => M.externalWallets),
  /** Records a top up from a connected external wallet once the user confirmed it there. */
  topUp: (amountUsdc: number, fromWallet: string) =>
    request<Wallet>({ method: 'POST', path: E.wallet.topUp, body: { amountUsdc, fromWallet } }, () => {
      M.wallet.balanceUsdc += amountUsdc;
      return M.wallet;
    }),
};

const find = (id: string) => P.consultations[id] ?? P.consultations.c_luna!;

export const consultationsApi = {
  get: (id: string) => request<Consultation>({ path: E.consultations.detail, params: { id } }, () => find(id)),
  /** Sends a message as the signed-in user (`from` is decided by the backend from the session). */
  send: (id: string, text: string, from: 'patient' | 'doctor') =>
    request<ChatMessage>({ method: 'POST', path: E.consultations.messages, params: { id }, body: { text } }, () => {
      const msg: ChatMessage = { id: P.nextMessageId(), from, text };
      find(id).messages.push(msg);
      return msg;
    }),
  /** Polls for new messages. Replace with a websocket when the backend has one. */
  messages: (id: string) => request<ChatMessage[]>({ path: E.consultations.messages, params: { id } }, () => find(id).messages),
  reveal: (id: string, fields: RevealField[], duration: string) =>
    request<ChatMessage>({ method: 'POST', path: E.consultations.reveal, params: { id }, body: { fields, duration } }, () => {
      const names: Record<RevealField, string> = { name: 'name', phone: 'phone number', location: 'location', summary: 'health summary' };
      const doctorFirst = find(id).doctor.name.split(' ').slice(0, 2).join(' ');
      const msg: ChatMessage = {
        id: P.nextMessageId(),
        from: 'system',
        text: `You shared your ${fields.map((f) => names[f]).join(', ')} with ${doctorFirst} for ${duration}. You can revoke this any time.`,
      };
      find(id).messages.push(msg);
      return msg;
    }),
  /** Patient marks complete: releases escrow and records an anonymous rating. */
  complete: (id: string, rating: number) =>
    request<void>({ method: 'POST', path: E.consultations.complete, params: { id }, body: { rating } }, () => {
      find(id).status = 'completed';
    }),
  refer: (id: string, careType: string, urgency: string, note: string) =>
    request<ChatMessage>({ method: 'POST', path: E.consultations.refer, params: { id }, body: { careType, urgency, note } }, () => {
      const c = find(id);
      const msg: ChatMessage = {
        id: P.nextMessageId(),
        from: 'system',
        text: `You suggested ${careType.toLowerCase()} care (${urgency.toLowerCase()}). ${c.patientAlias} must accept before anything is shared with a hospital.`,
      };
      c.messages.push(msg);
      return msg;
    }),
  /** Doctor finishes: the patient is asked to confirm and rate. */
  finish: (id: string) =>
    request<ChatMessage>({ method: 'POST', path: E.consultations.finish, params: { id } }, () => {
      const c = find(id);
      c.status = 'awaiting_confirmation';
      const msg: ChatMessage = {
        id: P.nextMessageId(),
        from: 'system',
        text: `You finished this consultation. Waiting for ${c.patientAlias} to confirm. Payment is released after she confirms.`,
      };
      c.messages.push(msg);
      return msg;
    }),
};

