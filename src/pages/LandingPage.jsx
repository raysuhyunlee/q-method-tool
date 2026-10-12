import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useSession } from '../context/SessionContext';
import { Button, Panel, PageTitle } from '../components/ui';

const Container = styled.div`
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  padding: var(--space-7) var(--space-4);
`;

const Form = styled(Panel).attrs({ as: 'form' })`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6);

  @media (max-width: 480px) {
    padding: var(--space-5);
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const Label = styled.label`
  font-size: var(--font-sm);
  font-weight: 600;
`;

const controlStyles = `
  width: 100%;
  height: var(--control-height);
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-strong);
  background: var(--surface);
  transition: border-color 0.15s;

  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }
`;

const Input = styled.input`
  ${controlStyles}
  border-color: ${({ $invalid }) => ($invalid ? 'var(--danger)' : 'var(--border-strong)')};
`;

const Select = styled.select`
  ${controlStyles}
  border-color: ${({ $invalid }) => ($invalid ? 'var(--danger)' : 'var(--border-strong)')};
`;

const ErrorMsg = styled.span`
  color: var(--danger);
  font-size: var(--font-sm);
`;

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { experimentId, lang } = useParams();
  const experiment = useOutletContext();
  const { userData, placements, completed, update } = useSession();
  const [form, setForm] = useState(userData);
  const [errors, setErrors] = useState({});

  if (completed) return <Navigate to={`/${experimentId}/${lang}/finish`} replace />;

  const prefKey = `preference.${experiment.preference}`;
  const hasProgress = Object.keys(placements).length > 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = t('landing.error_name');
    if (!form.age || isNaN(form.age)) next.age = t('landing.error_age');
    if (!form.gender) next.gender = t('landing.error_required');
    if (!form.preference) next.preference = t('landing.error_required');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    update({ userData: { ...form, name: form.name.trim() } });
    navigate(`/${experimentId}/${lang}/sort`);
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit} noValidate>
        <PageTitle>{experiment.title[i18n.language] ?? experiment.title.ko}</PageTitle>

        <Field>
          <Label htmlFor="name">{t('landing.name')}</Label>
          <Input id="name" name="name" autoComplete="name" value={form.name} onChange={handleChange} $invalid={!!errors.name} />
          {errors.name && <ErrorMsg>{errors.name}</ErrorMsg>}
        </Field>

        <Field>
          <Label htmlFor="age">{t('landing.age')}</Label>
          <Input id="age" name="age" type="number" inputMode="numeric" min="1" value={form.age} onChange={handleChange} $invalid={!!errors.age} />
          {errors.age && <ErrorMsg>{errors.age}</ErrorMsg>}
        </Field>

        <Field>
          <Label htmlFor="gender">{t('landing.gender')}</Label>
          <Select id="gender" name="gender" value={form.gender} onChange={handleChange} $invalid={!!errors.gender}>
            <option value="">{t('landing.select')}</option>
            <option value="male">{t('landing.gender_male')}</option>
            <option value="female">{t('landing.gender_female')}</option>
            <option value="other">{t('landing.gender_other')}</option>
          </Select>
          {errors.gender && <ErrorMsg>{errors.gender}</ErrorMsg>}
        </Field>

        <Field>
          <Label htmlFor="preference">{t(`${prefKey}.label`)}</Label>
          <Select id="preference" name="preference" value={form.preference} onChange={handleChange} $invalid={!!errors.preference}>
            <option value="">{t('landing.select')}</option>
            <option value="high">{t(`${prefKey}.high`)}</option>
            <option value="medium">{t(`${prefKey}.medium`)}</option>
            <option value="low">{t(`${prefKey}.low`)}</option>
          </Select>
          {errors.preference && <ErrorMsg>{errors.preference}</ErrorMsg>}
        </Field>

        <Button type="submit">{t(hasProgress ? 'landing.continue_button' : 'landing.start_button')}</Button>
      </Form>
    </Container>
  );
};

export default LandingPage;
