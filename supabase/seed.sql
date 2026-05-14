-- ============================================================
-- SEED DATA — Akira Fight Club Chile
-- ============================================================

-- Disciplinas
insert into public.disciplinas (nombre, descripcion, color) values
  ('Box', 'Boxeo clásico para todos los niveles', '#E8000D'),
  ('Muay Thai', 'Arte marcial tailandés de los 8 miembros', '#FF6B00'),
  ('MMA', 'Artes Marciales Mixtas - entrenamiento completo', '#8B00FF'),
  ('Defensa Personal', 'Técnicas prácticas de defensa personal', '#0066FF');

-- Planes
insert into public.planes (nombre, precio, duracion_dias, clases_incluidas, descripcion, activo) values
  ('Plan Mensual', 35000, 30, null, 'Clases ilimitadas por 30 días', true),
  ('Plan Trimestral', 90000, 90, null, 'Clases ilimitadas por 3 meses — ahorra $15.000', true),
  ('Plan Anual', 320000, 365, null, 'Clases ilimitadas por 1 año — el mejor precio', true),
  ('Pack 10 Clases', 28000, 60, 10, '10 clases a usar en 60 días', true),
  ('Plan Estudiante', 25000, 30, null, 'Clases ilimitadas con carnet estudiantil vigente', true);

-- NOTA: Los perfiles de usuarios de ejemplo se crean después de que
-- el admin cree los usuarios en Supabase Auth.
-- Los datos de ejemplo a continuación asumen que los usuarios ya existen.

-- Horarios de ejemplo (se insertan después de tener instructores creados)
-- Ejecutar este bloque manualmente o via función después de crear los usuarios:

/*
insert into public.horarios (disciplina_id, instructor_id, dia_semana, hora_inicio, hora_fin, sala, cupos_max, activo) values
  ('d1000000-0000-0000-0000-000000000001', '<instructor_id>', 1, '07:00', '08:00', 'Ring Principal', 20, true),  -- Lunes Box mañana
  ('d1000000-0000-0000-0000-000000000001', '<instructor_id>', 1, '19:00', '20:00', 'Ring Principal', 20, true),  -- Lunes Box tarde
  ('d1000000-0000-0000-0000-000000000002', '<instructor_id>', 2, '19:00', '20:30', 'Tatami', 15, true),          -- Martes Muay Thai
  ('d1000000-0000-0000-0000-000000000003', '<instructor_id>', 3, '20:00', '21:30', 'Jaula', 12, true),           -- Miércoles MMA
  ('d1000000-0000-0000-0000-000000000001', '<instructor_id>', 4, '07:00', '08:00', 'Ring Principal', 20, true),  -- Jueves Box mañana
  ('d1000000-0000-0000-0000-000000000002', '<instructor_id>', 4, '19:00', '20:30', 'Tatami', 15, true),          -- Jueves Muay Thai
  ('d1000000-0000-0000-0000-000000000001', '<instructor_id>', 5, '07:00', '08:00', 'Ring Principal', 20, true),  -- Viernes Box
  ('d1000000-0000-0000-0000-000000000004', '<instructor_id>', 6, '10:00', '11:30', 'Tatami', 20, true);          -- Sábado Defensa Personal
*/
