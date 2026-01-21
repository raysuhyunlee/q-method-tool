import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useUser } from '../context/UserContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const Card = styled.div`
  background: var(--card-bg);
  backdrop-filter: blur(12px);
  border: var(--glass-border);
  box-shadow: var(--glass-shadow);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  animation: fadeIn 0.6s ease-out;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 10px;
  text-align: center;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.8); /* Darker for dropdown visibility */
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMsg = styled.span`
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 4px;
  display: block;
`;

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams();
  const { updateUser, userData } = useUser();
  const [localData, setLocalData] = useState(userData);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!localData.name.trim()) newErrors.name = 'Name is required';
    if (!localData.age || isNaN(localData.age)) newErrors.age = 'Valid age is required';
    if (!localData.gender) newErrors.gender = 'Gender is required';
    if (!localData.kpopPreference) newErrors.kpopPreference = 'Preference is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      updateUser(localData);
      navigate(`/${lang}/sort`);
    }
  };

  return (
    <div className="page-container">
      <Container>
        <Card>
          <Title>{t('landing.title')}</Title>
          <Subtitle>{t('landing.description')}</Subtitle>

          <FormGroup>
            <Label>{t('landing.name')}</Label>
            <Input
              name="name"
              value={localData.name}
              onChange={handleChange}
              placeholder={t('landing.name')}
            />
            {errors.name && <ErrorMsg>{errors.name}</ErrorMsg>}
          </FormGroup>

          <FormGroup>
            <Label>{t('landing.age')}</Label>
            <Input
              name="age"
              type="number"
              value={localData.age}
              onChange={handleChange}
              placeholder={t('landing.age')}
            />
            {errors.age && <ErrorMsg>{errors.age}</ErrorMsg>}
          </FormGroup>

          <FormGroup>
            <Label>{t('landing.gender')}</Label>
            <Select name="gender" value={localData.gender} onChange={handleChange}>
              <option value="">{t('landing.gender')}...</option>
              <option value="male">{t('landing.gender_male')}</option>
              <option value="female">{t('landing.gender_female')}</option>
              <option value="other">{t('landing.gender_other')}</option>
            </Select>
            {errors.gender && <ErrorMsg>{errors.gender}</ErrorMsg>}
          </FormGroup>

          <FormGroup>
            <Label>{t('landing.kpop_preference')}</Label>
            <Select name="kpopPreference" value={localData.kpopPreference} onChange={handleChange}>
              <option value="">{t('landing.kpop_preference')}...</option>
              <option value="high">{t('landing.kpop_high')}</option>
              <option value="medium">{t('landing.kpop_medium')}</option>
              <option value="low">{t('landing.kpop_low')}</option>
            </Select>
            {errors.kpopPreference && <ErrorMsg>{errors.kpopPreference}</ErrorMsg>}
          </FormGroup>

          <Button onClick={handleSubmit}>{t('landing.start_button')}</Button>
        </Card>
      </Container>
    </div>
  );
};

export default LandingPage;
