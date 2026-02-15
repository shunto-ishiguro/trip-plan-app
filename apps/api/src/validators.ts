import { t } from 'elysia';

export const budgetCategorySchema = t.Union([
  t.Literal('transport'),
  t.Literal('accommodation'),
  t.Literal('food'),
  t.Literal('activity'),
  t.Literal('other'),
]);

export const pricingTypeSchema = t.Union([t.Literal('total'), t.Literal('per_person')]);

export const checklistTypeSchema = t.Union([t.Literal('packing'), t.Literal('todo')]);

export const reservationTypeSchema = t.Union([
  t.Literal('flight'),
  t.Literal('hotel'),
  t.Literal('rental_car'),
  t.Literal('restaurant'),
  t.Literal('activity'),
  t.Literal('other'),
]);

export const sharePermissionSchema = t.Union([t.Literal('view'), t.Literal('edit')]);

export const tripRoleSchema = t.Union([
  t.Literal('owner'),
  t.Literal('editor'),
  t.Literal('viewer'),
]);
