INSERT INTO public.companies(code, name, name_th, name_en)
VALUES ('SCP','SCP','หจก. SCP','SCP')
ON CONFLICT (code) DO NOTHING;
