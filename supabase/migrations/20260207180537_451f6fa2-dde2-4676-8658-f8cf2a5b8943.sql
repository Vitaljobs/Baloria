-- Make james@live.nl admin on Baloria project
INSERT INTO public.user_roles (user_id, project_id, role)
VALUES ('e8198078-31fb-4c2b-89f7-425849abd945', 'ac5c2402-1927-4c4f-8357-33c4dcc00843', 'admin')
ON CONFLICT DO NOTHING;