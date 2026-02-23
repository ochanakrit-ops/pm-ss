-- Minimal seed for quick testing (plain password_hash for MVP)

-- Company
insert into companies(code, name, name_th, name_en)
select 'SCP', 'SCP', 'SCP', 'SCP'
where not exists (select 1 from companies where code='SCP');

-- Team
insert into teams(company_id, name)
select c.id, 'BS1'
from companies c
where c.code='SCP'
  and not exists (select 1 from teams t where t.company_id=c.id and t.name='BS1');

-- HR admin
insert into users(company_id, team_id, username, password_hash, role, full_name, salary, is_active)
select c.id, t.id, 'hradmin', 'Pmss@1234', 'HR_ADMIN', 'HR Admin', 50000, true
from companies c
join teams t on t.company_id=c.id and t.name='BS1'
where c.code='SCP'
  and not exists (select 1 from users u where u.company_id=c.id and u.username='hradmin');

-- TEAM_LEADER
insert into users(company_id, team_id, username, password_hash, role, full_name, salary, is_active)
select c.id, t.id, 'teamlead', 'Pmss@1234', 'TEAM_LEADER', 'Team Lead', 40000, true
from companies c
join teams t on t.company_id=c.id and t.name='BS1'
where c.code='SCP'
  and not exists (select 1 from users u where u.company_id=c.id and u.username='teamlead');

-- TECHNICIAN
insert into users(company_id, team_id, username, password_hash, role, full_name, salary, is_active)
select c.id, t.id, 'tech1', 'Pmss@1234', 'TECHNICIAN', 'Technician 1', 25000, true
from companies c
join teams t on t.company_id=c.id and t.name='BS1'
where c.code='SCP'
  and not exists (select 1 from users u where u.company_id=c.id and u.username='tech1');
