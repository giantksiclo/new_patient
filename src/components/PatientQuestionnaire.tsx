import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

// ------------------------------
// 1) 유효성 검사 함수들
// ------------------------------

// (a) 주민등록번호 검증
/* 주민등록번호 유효성 검증 로직 주석 처리
const isValidResidentId = (value: string) => {
  const digits = value.replace('-', '');
  if (digits.length !== 13) return false;
  const multipliers = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i], 10) * multipliers[i];
  }
  const remainder = (11 - (sum % 11)) % 10;
  const checkDigit = parseInt(digits[12], 10);
  return remainder === checkDigit;
};
*/

// (b) 이메일 검증 (입력 시만) - (현재 미사용)
/* 미사용 함수 주석 처리
const isValidEmail = (value: string) => {
  if (!value) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};
*/

// (c) 한국 휴대폰 번호만 허용 (010,011,016,017,018,019)
const isValidKoreanPhoneNumber = (phone: string) => {
  const pattern = /^(010|011|016|017|018|019)-\d{3,4}-\d{4}$/;
  return pattern.test(phone);
};

// (d) 날짜시각 포매팅 (YYYY-MM-DD HH:mm:ss)
const formatDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  const secs = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
};

// ------------------------------
// 2) 폼 데이터 타입 + 초기값
// ------------------------------
interface FormData {
  atClinic: boolean | null;
  consent: boolean;
  name: string;
  residentId: string;
  gender: string;
  phone: string;
  address: string;

  // 이메일은 사용하지 않으므로 주석처리
  // email: string;

  // 사보험 가입 여부 + 보험사 + 사보험 가입기간
  hasPrivateInsurance: boolean | null;
  privateInsurancePeriod: string;    // 6개월 미만, 6개월~1년, ...
  insuranceCompany: string;

  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  visitReason: string;
  treatmentArea: string[];
  referralSource: string;
  referrerName: string;   
  referrerPhone: string; 
  referrerBirthYear: string;

  lastVisit: string;
  medications: string[];
  otherMedication: string;
  medicalConditions: string[];
  otherCondition: string;
  allergies: string[];
  otherAllergy: string;
  pregnancyStatus: string;
  pregnancyWeek: string;
  smokingStatus: string;
  smokingAmount: string;
  dentalFears: string;
  additionalInfo: string;
}

const initialFormData: FormData = {
  atClinic: null,
  consent: false,
  name: '',
  residentId: '',
  gender: '',
  phone: '',
  address: '',

  // email: '', // 주석처리한 이메일

  hasPrivateInsurance: null,
  privateInsurancePeriod: '',
  insuranceCompany: '',

  emergencyContact: {
    name: '',
    relation: '',
    phone: '',
  },
  visitReason: '',
  treatmentArea: [],
  referralSource: '',
  referrerName: '',
  referrerPhone: '',
  referrerBirthYear: '',

  lastVisit: '',
  medications: [],
  otherMedication: '',
  medicalConditions: [],
  otherCondition: '',
  allergies: [],
  otherAllergy: '',
  pregnancyStatus: '',
  pregnancyWeek: '',
  smokingStatus: '',
  smokingAmount: '',
  dentalFears: '',
  additionalInfo: '',
};

const PatientQuestionnaire: React.FC = () => {
  const totalPages = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // ------------------------------
  // 3) 페이지별 필수검증
  // ------------------------------
  const isPageValid = () => {
    switch (currentPage) {
      case 1:
        return formData.atClinic !== null;
      case 2:
        return !!formData.name.trim();
      case 3:
        // 주민등록번호 유효성 검사 제거, 형식만 확인
        return formData.residentId.length === 14;
      case 4:
        return !!formData.phone.trim() && isValidKoreanPhoneNumber(formData.phone);
      case 5:
        return !!formData.address.trim();

      // case 6:  // (구) 이메일
      //   return isValidEmail(formData.email);

      case 6: // 사보험 가입 여부 & 기간
        if (formData.hasPrivateInsurance === null) return false;
        // 가입했다면 기간 필수 선택
        if (formData.hasPrivateInsurance === true && !formData.privateInsurancePeriod) {
          return false;
        }
        return true;

      case 7:
        // 긴급 연락처는 선택사항이지만, 입력했다면 유효해야 함.
        if (formData.emergencyContact.phone.trim() !== '') {
          return isValidKoreanPhoneNumber(formData.emergencyContact.phone);
        }
        return true;
      case 8:
        return !!formData.visitReason.trim();
      case 9:
        return formData.treatmentArea.length > 0;
      case 10:
        return !!formData.referralSource.trim();
      case 11:
        // 소개자 전화번호: 선택사항이지만 입력 시 유효해야 함.
        if (formData.referrerPhone.trim() !== '') {
          return isValidKoreanPhoneNumber(formData.referrerPhone);
        }
        return true;
      case 12:
        return !!formData.lastVisit.trim();
      case 13:
        return formData.medications.length > 0;
      case 14:
        return formData.medicalConditions.length > 0;
      case 15:
        return formData.allergies.length > 0;
      case 16:
        if (!formData.pregnancyStatus) return false;
        if (formData.pregnancyStatus === '임신 중') {
          return !!formData.pregnancyWeek;
        }
        return true;
      case 17:
        if (!formData.smokingStatus) return false;
        if (formData.smokingStatus === '흡연') {
          return !!formData.smokingAmount;
        }
        return true;
      case 18:
        return !!formData.dentalFears;
      case 19:
        return true; // 추가 정보 비필수
      case 20:
        return true; // 개인정보 동의는 선택
      default:
        return true;
    }
  };

  // ------------------------------
  // 4) 진행률 업데이트
  // ------------------------------
  useEffect(() => {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      progressBar.style.width = `${(currentPage / totalPages) * 100}%`;
    }
    const progressText = document.getElementById('progressText');
    if (progressText) {
      progressText.textContent = `진행률: ${Math.round((currentPage / totalPages) * 100)}%`;
    }
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  // ------------------------------
  // 5) onChange 처리 (input, select, textarea)
  // ------------------------------
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // (a) 주민등록번호 + 성별 추론
    if (name === 'residentId') {
      let formattedValue = value.replace(/[^0-9]/g, '');
      if (formattedValue.length > 6) {
        formattedValue = `${formattedValue.slice(0, 6)}-${formattedValue.slice(6, 13)}`;
      }
      if (formattedValue.length >= 8) {
        const genderDigit = formattedValue.charAt(7);
        let gender = '';
        if (['1', '3', '5', '7'].includes(genderDigit)) gender = '남성';
        if (['2', '4', '6', '8'].includes(genderDigit)) gender = '여성';
        setFormData({ ...formData, residentId: formattedValue, gender });
      } else {
        setFormData({ ...formData, residentId: formattedValue });
      }
      return;
    }

    // (b) 전화번호 (본인, 긴급 연락처, 소개자)
    if (name === 'phone' || name === 'emergencyContact.phone' || name === 'referrerPhone') {
      let digits = value.replace(/[^0-9]/g, '');
      if (digits.length <= 3) {
        // 그대로
      } else if (digits.length <= 6) {
        digits = digits.replace(/^(\d{3})(\d{1,3})$/, '$1-$2');
      } else if (digits.length <= 10) {
        digits = digits.replace(/^(\d{3})(\d{3,4})(\d{1,4})$/, '$1-$2-$3');
      } else {
        digits = digits.slice(0, 11);
        digits = digits.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3');
      }
      if (name === 'phone') {
        setFormData({ ...formData, phone: digits });
      } else if (name === 'referrerPhone') {
        setFormData({ ...formData, referrerPhone: digits });
      } else {
        setFormData({
          ...formData,
          emergencyContact: {
            ...formData.emergencyContact,
            phone: digits,
          },
        });
      }
      return;
    }

    // (c) 중첩 객체 (예: emergencyContact.name)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'emergencyContact') {
        setFormData({
          ...formData,
          emergencyContact: {
            ...formData.emergencyContact,
            [child]: value,
          },
        });
      }
      return;
    }

    // (d) 일반 필드
    setFormData({ ...formData, [name]: value });
  };

  // ------------------------------
  // 6) 체크박스 처리 (약물, 질환, 알레르기)
  // ------------------------------
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    if (name === 'medications') {
      let updated = [...formData.medications];
      if (value === 'none' && checked) {
        updated = ['none'];
      } else if (checked) {
        updated = updated.filter(v => v !== 'none');
        updated.push(value);
      } else {
        updated = updated.filter(v => v !== value);
      }
      setFormData({ ...formData, medications: updated });
    } else if (name === 'medicalConditions') {
      let updated = [...formData.medicalConditions];
      if (value === 'none' && checked) {
        updated = ['none'];
      } else if (checked) {
        updated = updated.filter(v => v !== 'none');
        updated.push(value);
      } else {
        updated = updated.filter(v => v !== value);
      }
      setFormData({ ...formData, medicalConditions: updated });
    } else if (name === 'allergies') {
      let updated = [...formData.allergies];
      if (value === 'none' && checked) {
        updated = ['none'];
      } else if (checked) {
        updated = updated.filter(v => v !== 'none');
        updated.push(value);
      } else {
        updated = updated.filter(v => v !== value);
      }
      setFormData({ ...formData, allergies: updated });
    }
  };

  // ------------------------------
  // 7) 단일 선택 (라디오 버튼처럼)
  // ------------------------------
  const handleOptionSelect = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  // ------------------------------
  // 8) 치료부위 여러 개 선택
  // ------------------------------
  const handleAreaSelect = (area: string) => {
    const updated = formData.treatmentArea.includes(area)
      ? formData.treatmentArea.filter(a => a !== area)
      : [...formData.treatmentArea, area];
    setFormData({ ...formData, treatmentArea: updated });
  };

  // ------------------------------
  // 9) 개인정보 동의 (토글)
  // ------------------------------
  const handleConsent = () => {
    setFormData({ ...formData, consent: !formData.consent });
  };

  // ------------------------------
  // 10) 최종 제출
  // ------------------------------
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submittedAt = formatDateTime(new Date());
      const payload = { ...formData, submittedAt };
      const webhookUrl = 'https://hook.eu2.make.com/gvnnfnm9x7yk0v5oyz39313hv7ap523x';
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setIsComplete(true);
        toast.success('문진표가 성공적으로 제출되었습니다.');
      } else {
        toast.error('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------
  // 11) 제출 완료 화면
  // ------------------------------
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-gray-700">
          <CheckCircle className="mx-auto text-green-400 mb-4" size={64} />
          <h1 className="text-3xl font-bold mb-4 text-cyan-400">제출 완료</h1>
          <p className="text-xl mb-6 text-gray-300">문진표가 성공적으로 제출되었습니다.</p>
          <p className="text-lg mb-8 text-gray-400">접수 데스크에 방문하여 접수를 완료해주세요.</p>
        </div>
      </div>
    );
  }

  // ------------------------------
  // 12) 페이지별 렌더링
  // ------------------------------
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-700">
        {/* 진행률 바 */}
        <div className="progress-container bg-gray-700 h-4 rounded-full mb-2">
          <div
            id="progressBar"
            className="progress-bar bg-cyan-500 h-full rounded-full"
            style={{ width: `${(currentPage / totalPages) * 100}%` }}
          />
        </div>
        <p id="progressText" className="text-center text-lg font-medium text-cyan-400 mb-6">
          진행률: {Math.round((currentPage / totalPages) * 100)}%
        </p>

        {/* Page 1: 현재 샤인치과에 계신가요? */}
        {currentPage === 1 && (
          <div className="form-page">
            <h1 className="text-3xl font-bold text-center mb-6 text-cyan-400 border-b-2 border-gray-700 pb-4">
              샤인치과 초진환자 문진표
            </h1>
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">현재 샤인치과에 계신가요?</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleOptionSelect('atClinic', true)}
                className={`p-5 text-xl font-bold rounded-xl transition-colors ${
                  formData.atClinic === true
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                예
              </button>
              <button
                type="button"
                onClick={() => handleOptionSelect('atClinic', false)}
                className={`p-5 text-xl font-bold rounded-xl transition-colors ${
                  formData.atClinic === false
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                아니오
              </button>
            </div>
          </div>
        )}

        {/* Page 2: 이름 */}
        {currentPage === 2 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">1. 성명 (필수)</h2>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="성명을 입력해주세요"
              className="w-full p-5 text-xl bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-400"
              required
            />
          </div>
        )}

        {/* Page 3: 주민등록번호 */}
        {currentPage === 3 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">2. 주민등록번호 (필수)</h2>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              name="residentId"
              value={formData.residentId}
              onChange={handleInputChange}
              placeholder="예: 123456-1234567"
              maxLength={14}
              className="w-full p-5 text-xl bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-400"
              required
            />
            <p className="mt-2 text-gray-400 text-lg">
              하이픈(-)은 자동 입력됩니다.
            </p>
            {/* 주민등록번호 유효성 검사 메시지 주석 처리
            {formData.residentId.length === 14 && !isValidResidentId(formData.residentId) && (
              <p className="text-red-400 mt-2">유효하지 않은 주민등록번호입니다.</p>
            )}
            */}
          </div>
        )}

        {/* Page 4: 연락처 */}
        {currentPage === 4 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">3. 연락처 (필수)</h2>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="예: 01012345678"
              maxLength={13}
              className="w-full p-5 text-xl bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-400"
              required
            />
            <p className="mt-2 text-gray-400 text-lg">
              하이픈(-)은 자동 입력됩니다 (예: 010-1234-5678)
            </p>
            {formData.phone.trim() !== '' && !isValidKoreanPhoneNumber(formData.phone) && (
              <p className="text-red-400 mt-2">유효하지 않은 전화번호입니다. 예) 010-1234-5678</p>
            )}
          </div>
        )}

        {/* Page 5: 주소 */}
        {currentPage === 5 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">4. 주소 (필수)</h2>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="주소를 입력해주세요"
              className="w-full p-5 text-xl bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 h-[150px] text-white placeholder-gray-400"
              required
            />
          </div>
        )}

        {/* (구) 이메일 페이지 주석처리 */}
        {/* 
        {currentPage === 6 && (
          <div> (이메일 관련 페이지) </div>
        )}
        */}

        {/* Page 6: 사보험 가입 여부 + 가입기간 + 보험사 (선택) */}
        {currentPage === 6 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">
              5. 사보험(실손/치과보험 등) 가입 여부 (필수)
            </h2>
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => handleOptionSelect('hasPrivateInsurance', true)}
                className={`w-1/2 p-5 text-xl font-bold rounded-xl transition-colors ${
                  formData.hasPrivateInsurance === true
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                가입했어요
              </button>
              <button
                type="button"
                onClick={() => handleOptionSelect('hasPrivateInsurance', false)}
                className={`w-1/2 p-5 text-xl font-bold rounded-xl transition-colors ${
                  formData.hasPrivateInsurance === false
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                가입 안했어요
              </button>
            </div>

            {formData.hasPrivateInsurance === true && (
              <>
                {/* 사보험 가입 기간 선택 */}
                <h3 className="text-xl font-bold mb-2 text-cyan-400">
                  사보험 가입 기간 (필수)
                </h3>
                <div className="grid grid-cols-1 gap-3 mb-5">
                  {[
                    { value: '6개월 미만', label: '6개월 미만' },
                    { value: '6개월 ~ 1년', label: '6개월 ~ 1년' },
                    { value: '1년 ~ 2년', label: '1년 ~ 2년' },
                    { value: '2년 이상', label: '2년 이상' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleOptionSelect('privateInsurancePeriod', opt.value)}
                      className={`p-4 text-lg font-medium rounded-xl transition-colors ${
                        formData.privateInsurancePeriod === opt.value
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* 보험사 입력 (선택) */}
                <h3 className="text-xl font-bold mb-2 text-cyan-400">
                  보험사 (선택)
                </h3>
                <input
                  type="text"
                  name="insuranceCompany"
                  value={formData.insuranceCompany}
                  onChange={handleInputChange}
                  placeholder="예: ○○손해보험, ○○화재 등"
                  className="w-full p-5 text-xl bg-gray-700 border-2 border-gray-600 rounded-xl 
                             focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                             text-white placeholder-gray-400"
                />
              </>
            )}
          </div>
        )}

        {/* Page 7: 긴급 연락처 (선택) */}
        {currentPage === 7 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">6. 긴급 연락처 (선택)</h2>
            <div className="space-y-4">
              <input
                type="text"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleInputChange}
                placeholder="긴급 연락처 성명"
                className="w-full p-5 text-xl bg-gray-700 border-2 border-gray-600 
                           rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                           text-white placeholder-gray-400"
              />
              <select
                name="emergencyContact.relation"
                value={formData.emergencyContact.relation}
                onChange={handleInputChange}
                className="w-full p-5 text-xl bg-gray-700 border-2 border-gray-600 
                           rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                           text-white"
              >
                <option value="" className="bg-gray-800">
                  관계 선택
                </option>
                <option value="배우자" className="bg-gray-800">
                  배우자
                </option>
                <option value="부모" className="bg-gray-800">
                  부모
                </option>
                <option value="자녀" className="bg-gray-800">
                  자녀
                </option>
                <option value="형제/자매" className="bg-gray-800">
                  형제/자매
                </option>
                <option value="기타" className="bg-gray-800">
                  기타
                </option>
              </select>
              <input
                type="tel"
                name="emergencyContact.phone"
                value={formData.emergencyContact.phone}
                onChange={handleInputChange}
                placeholder="긴급 연락처 번호"
                className="w-full p-5 text-xl bg-gray-700 border-2 border-gray-600 
                           rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                           text-white placeholder-gray-400"
              />
              {formData.emergencyContact.phone.trim() !== '' &&
                !isValidKoreanPhoneNumber(formData.emergencyContact.phone) && (
                  <p className="text-red-400 mt-2">
                    유효하지 않은 전화번호입니다. 예) 010-1234-5678
                  </p>
              )}
            </div>
          </div>
        )}

        {/* Page 8: 내원 이유 */}
        {currentPage === 8 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">
              7. 어디가 불편하셔서 내원하셨나요? (필수)
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: '정기검진', label: '정기검진' },
                { value: '이가 아파요', label: '이가 아파요' },
                { value: '이가 시려요', label: '이가 시려요' },
                { value: '잇몸이 부었어요', label: '잇몸이 부었어요' },
                { value: '이빼러 왔어요', label: '이빼러 왔어요' },
                { value: '치아에 구멍이 난 것 같아요', label: '치아에 구멍이 난 것 같아요' },
                { value: '충치가 생긴 것 같아요', label: '충치가 생긴 것 같아요' },
                { value: '임플란트 상담', label: '임플란트 상담' },
                { value: '교정상담', label: '교정상담' },
                { value: '미백', label: '미백' },
                { value: '앞니성형', label: '앞니성형' },
                { value: '기타', label: '기타' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionSelect('visitReason', option.value)}
                  className={`p-4 text-xl font-medium rounded-xl transition-colors ${
                    formData.visitReason === option.value
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Page 9: 치료부위 */}
        {currentPage === 9 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold text-cyan-400 text-center mb-6">
              8. 치료가 필요한 부위 (필수)
            </h2>
            <p className="text-lg text-gray-300 text-center mb-8">
              불편한 부위를 선택해주세요 (여러 개 가능)
            </p>
        
            {/* 상단에 "전체적으로 봐주세요" 버튼 한 줄 추가 */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => handleAreaSelect('전체적으로 봐주세요')}
                className={`w-full p-4 text-xl font-medium rounded-xl transition-colors mb-2
                  flex items-center justify-center text-center
                  ${
                    formData.treatmentArea.includes('전체적으로 봐주세요')
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                전체적으로 봐주세요
              </button>
            </div>
        
            {/* 기존 2컬럼 레이아웃 (오른/왼쪽 위아래 어금니, 앞니) */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleAreaSelect('오른쪽 위 어금니')}
                className={`p-4 text-lg font-medium rounded-xl transition-colors flex flex-col items-center justify-center text-center min-h-[80px] ${
                  formData.treatmentArea.includes('오른쪽 위 어금니')
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>오른쪽</span>
                <span>위 어금니</span>
              </button>
              <button
                type="button"
                onClick={() => handleAreaSelect('왼쪽 위 어금니')}
                className={`p-4 text-lg font-medium rounded-xl transition-colors flex flex-col items-center justify-center text-center min-h-[80px] ${
                  formData.treatmentArea.includes('왼쪽 위 어금니')
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>왼쪽</span>
                <span>위 어금니</span>
              </button>
              <button
                type="button"
                onClick={() => handleAreaSelect('위 앞니')}
                className={`p-4 text-lg font-medium rounded-xl transition-colors flex flex-col items-center justify-center text-center min-h-[80px] ${
                  formData.treatmentArea.includes('위 앞니')
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                위 앞니
              </button>
              <button
                type="button"
                onClick={() => handleAreaSelect('아래 앞니')}
                className={`p-4 text-lg font-medium rounded-xl transition-colors flex flex-col items-center justify-center text-center min-h-[80px] ${
                  formData.treatmentArea.includes('아래 앞니')
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                아래 앞니
              </button>
              <button
                type="button"
                onClick={() => handleAreaSelect('오른쪽 아래 어금니')}
                className={`p-4 text-lg font-medium rounded-xl transition-colors flex flex-col items-center justify-center text-center min-h-[80px] ${
                  formData.treatmentArea.includes('오른쪽 아래 어금니')
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>오른쪽</span>
                <span>아래 어금니</span>
              </button>
              <button
                type="button"
                onClick={() => handleAreaSelect('왼쪽 아래 어금니')}
                className={`p-4 text-lg font-medium rounded-xl transition-colors flex flex-col items-center justify-center text-center min-h-[80px] ${
                  formData.treatmentArea.includes('왼쪽 아래 어금니')
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>왼쪽</span>
                <span>아래 어금니</span>
              </button>
            </div>
          </div>
        )}

        {/* Page 10: 치과를 알게 된 경로 */}
        {currentPage === 10 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">
              9. 저희 치과를 어떻게 알게 되셨나요? (필수)
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: '인터넷 검색', label: '인터넷 검색' },
                { value: 'SNS', label: 'SNS' },
                { value: '지인 소개', label: '지인 소개' },
                { value: '가까운 위치', label: '가까운 위치' },
                { value: '간판/현수막', label: '간판/현수막' },
                { value: '광고', label: '광고' },
                { value: '기타', label: '기타' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionSelect('referralSource', option.value)}
                  className={`p-4 text-xl font-medium rounded-xl transition-colors ${
                    formData.referralSource === option.value
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Page 11: 소개자 정보 (선택) + 소개자 몇년생 입력 */}
        {currentPage === 11 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">10. 소개자 정보 (선택)</h2>
            <input
              type="text"
              name="referrerName"
              value={formData.referrerName}
              onChange={handleInputChange}
              placeholder="소개자 성명 (해당 시)"
              className="w-full p-5 text-xl bg-gray-700 border-2 border-gray-600 
                         rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                         text-white placeholder-gray-400 mb-4"
            />
            <input
              type="tel"
              name="referrerPhone"
              value={formData.referrerPhone}
              onChange={handleInputChange}
              placeholder="소개자 연락처 (예: 010-1234-5678)"
              maxLength={13}
              className="w-full p-5 text-xl bg-gray-700 border-2 border-gray-600 
                         rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                         text-white placeholder-gray-400 mb-4"
            />
            {formData.referrerPhone.trim() !== '' &&
              !isValidKoreanPhoneNumber(formData.referrerPhone) && (
              <p className="text-red-400 mt-2">유효하지 않은 휴대폰 번호입니다.</p>
            )}
            <input
              type="text"
              name="referrerBirthYear"
              value={formData.referrerBirthYear}
              onChange={handleInputChange}
              placeholder="소개자 몇 년생인지 아시면 작성해주세요 (예: 1985)"
              className="w-full p-5 text-xl bg-gray-700 border-2 border-gray-600 
                         rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                         text-white placeholder-gray-400"
            />
            <p className="mt-2 text-gray-400 text-lg">
              소개로 내원하신 경우, 감사선물 발송을 위해 연락처/생년을 남겨주세요.
            </p>
          </div>
        )}

        {/* Page 12: 마지막 치과 방문 시기 */}
        {currentPage === 12 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">11. 마지막 치과 방문 시기 (필수)</h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: '6개월 이내', label: '6개월 이내' },
                { value: '6개월~1년', label: '6개월~1년' },
                { value: '1년~2년', label: '1년~2년' },
                { value: '2년~5년', label: '2년~5년' },
                { value: '5년 이상', label: '5년 이상' },
                { value: '처음 방문', label: '처음 방문' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionSelect('lastVisit', option.value)}
                  className={`p-4 text-xl font-medium rounded-xl transition-colors ${
                    formData.lastVisit === option.value
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Page 13: 복용 중인 약물 */}
        {currentPage === 13 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">12. 현재 복용 중인 약물 (필수)</h2>
            <p className="text-lg mb-6 text-gray-300">
              치과 치료에 영향을 줄 수 있는 약물을 복용하고 계시다면 선택해주세요 (여러 개 선택 가능)
            </p>
            <div className="space-y-3">
              {[
                { id: 'med-none', value: 'none', label: '복용 약물 없음' },
                { id: 'med-aspirin', value: '아스피린/항응고제', label: '아스피린/항응고제' },
                { id: 'med-bisphosphonate', value: '골다공증약', label: '골다공증약' },
                { id: 'med-bloodPressure', value: '혈압약', label: '혈압약' },
                { id: 'med-diabetes', value: '당뇨약', label: '당뇨약' },
                { id: 'med-steroid', value: '스테로이드', label: '스테로이드' },
                { id: 'med-anticoagulant', value: '혈전방지제', label: '혈전방지제' },
                { id: 'med-other', value: '기타', label: '기타' },
              ].map(option => (
                <div key={option.id} className="flex items-center p-3 bg-gray-700 rounded-xl">
                  <input
                    type="checkbox"
                    id={option.id}
                    name="medications"
                    value={option.value}
                    checked={formData.medications.includes(option.value)}
                    onChange={handleCheckboxChange}
                    className="w-6 h-6 text-cyan-500 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
                  />
                  <label htmlFor={option.id} className="ml-3 text-xl text-gray-300">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {formData.medications.includes('기타') && (
              <div className="mt-4">
                <input
                  type="text"
                  name="otherMedication"
                  value={formData.otherMedication}
                  onChange={handleInputChange}
                  placeholder="기타 약물을 입력해주세요"
                  className="w-full p-5 text-xl bg-gray-700 border-2 border-gray-600 rounded-xl 
                             focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                             text-white placeholder-gray-400"
                />
              </div>
            )}
          </div>
        )}

        {/* Page 14: 질환 */}
        {currentPage === 14 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">13. 현재 앓고 계신 질환 (필수)</h2>
            <p className="text-lg mb-6 text-gray-300">
              해당 질환을 모두 선택해주세요 (여러 개 선택 가능)
            </p>
            <div className="space-y-3">
              {[
                { id: 'condition-hypertension', value: '고혈압', label: '고혈압' },
                { id: 'condition-diabetes', value: '당뇨', label: '당뇨' },
                { id: 'condition-heartDisease', value: '심장질환', label: '심장질환' },
                { id: 'condition-stroke', value: '뇌졸중', label: '뇌졸중' },
                { id: 'condition-liver', value: '간질환', label: '간질환' },
                { id: 'condition-kidney', value: '신장질환', label: '신장질환' },
                { id: 'condition-thyroid', value: '갑상선질환', label: '갑상선질환' },
                { id: 'condition-cancer', value: '암', label: '암' },
                { id: 'condition-other', value: '기타', label: '기타' },
                { id: 'condition-none', value: 'none', label: '해당사항 없음' },
              ].map(option => (
                <div key={option.id} className="flex items-center p-3 bg-gray-700 rounded-xl">
                  <input
                    type="checkbox"
                    id={option.id}
                    name="medicalConditions"
                    value={option.value}
                    checked={formData.medicalConditions.includes(option.value)}
                    onChange={handleCheckboxChange}
                    className="w-6 h-6 text-cyan-500 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
                  />
                  <label htmlFor={option.id} className="ml-3 text-xl text-gray-300">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {formData.medicalConditions.includes('기타') && (
              <div className="mt-4">
                <input
                  type="text"
                  name="otherCondition"
                  value={formData.otherCondition}
                  onChange={handleInputChange}
                  placeholder="기타 질환을 입력해주세요"
                  className="w-full p-5 text-xl bg-gray-700 border-2 border-gray-600 rounded-xl 
                             focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                             text-white placeholder-gray-400"
                />
              </div>
            )}
          </div>
        )}

        {/* Page 15: 알레르기 */}
        {currentPage === 15 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">14. 알러지가 있으신가요? (필수)</h2>
            <p className="text-lg mb-6 text-gray-300">
              해당 알러지를 모두 선택해주세요 (여러 개 선택 가능)
            </p>
            <div className="space-y-3">
              {[
                { id: 'allergy-none', value: 'none', label: '알러지 없음' },
                { id: 'allergy-penicillin', value: '페니실린', label: '페니실린' },
                { id: 'allergy-antibiotics', value: '항생제', label: '항생제' },
                { id: 'allergy-anesthetics', value: '마취제', label: '마취제' },
                { id: 'allergy-latex', value: '라텍스', label: '라텍스' },
                { id: 'allergy-metals', value: '금속', label: '금속' },
                { id: 'allergy-other', value: '기타', label: '기타' },
              ].map(option => (
                <div key={option.id} className="flex items-center p-3 bg-gray-700 rounded-xl">
                  <input
                    type="checkbox"
                    id={option.id}
                    name="allergies"
                    value={option.value}
                    checked={formData.allergies.includes(option.value)}
                    onChange={handleCheckboxChange}
                    className="w-6 h-6 text-cyan-500 bg-gray-600 border-gray-500 rounded focus:ring-cyan-500"
                  />
                  <label htmlFor={option.id} className="ml-3 text-xl text-gray-300">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
            {formData.allergies.includes('기타') && (
              <div className="mt-4">
                <input
                  type="text"
                  name="otherAllergy"
                  value={formData.otherAllergy}
                  onChange={handleInputChange}
                  placeholder="기타 알레르기를 입력해주세요"
                  className="w-full p-5 text-xl bg-gray-700 border-2 border-gray-600 rounded-xl 
                             focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                             text-white placeholder-gray-400"
                />
              </div>
            )}
          </div>
        )}

        {/* Page 16: 임신/수유 여부 */}
        {currentPage === 16 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">
              15. 임신 또는 수유 중이신가요? (필수)
            </h2>
            <div className="grid grid-cols-1 gap-3 mb-6">
              {[
                { value: '아니오', label: '아니오' },
                { value: '임신 중', label: '임신 중' },
                { value: '수유 중', label: '수유 중' },
                { value: '해당 없음', label: '해당 없음' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionSelect('pregnancyStatus', option.value)}
                  className={`p-4 text-xl font-medium rounded-xl transition-colors ${
                    formData.pregnancyStatus === option.value
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {formData.pregnancyStatus === '임신 중' && (
              <div className="mt-4">
                <h3 className="text-xl font-bold mb-3 text-cyan-400">임신 주수 (필수)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: '1-12주', label: '1-12주' },
                    { value: '13-24주', label: '13-24주' },
                    { value: '25-36주', label: '25-36주' },
                    { value: '37주 이상', label: '37주 이상' },
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleOptionSelect('pregnancyWeek', option.value)}
                      className={`p-3 text-lg font-medium rounded-xl transition-colors ${
                        formData.pregnancyWeek === option.value
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Page 17: 흡연 여부 */}
        {currentPage === 17 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">16. 흡연 여부 (필수)</h2>
            <div className="grid grid-cols-1 gap-3 mb-6">
              {[
                { value: '비흡연', label: '비흡연' },
                { value: '흡연', label: '흡연' },
                { value: '과거 흡연', label: '과거 흡연' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionSelect('smokingStatus', option.value)}
                  className={`p-4 text-xl font-medium rounded-xl transition-colors ${
                    formData.smokingStatus === option.value
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {formData.smokingStatus === '흡연' && (
              <div className="mt-4">
                <h3 className="text-xl font-bold mb-3 text-cyan-400">흡연량 (필수)</h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: '반갑 미만/일', label: '반갑 미만/일' },
                    { value: '반갑~한갑/일', label: '반갑~한갑/일' },
                    { value: '한갑 이상/일', label: '한갑 이상/일' },
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleOptionSelect('smokingAmount', option.value)}
                      className={`p-3 text-lg font-medium rounded-xl transition-colors ${
                        formData.smokingAmount === option.value
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Page 18: 치과 불안감 */}
        {currentPage === 18 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">
              17. 치과 치료 시 불안감 (필수)
            </h2>
            <p className="text-lg mb-6 text-gray-300">치과 치료에 대한 불안감이 있으신가요?</p>
            <div className="grid grid-cols-1 gap-3 mb-8">
              {[
                { value: '없음', label: '없음' },
                { value: '약간 있음', label: '약간 있음' },
                { value: '보통', label: '보통' },
                { value: '심함', label: '심함' },
                { value: '매우 심함', label: '매우 심함' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionSelect('dentalFears', option.value)}
                  className={`p-4 text-lg font-medium rounded-xl transition-colors ${
                    formData.dentalFears === option.value
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Page 19: 추가 정보 */}
        {currentPage === 19 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">18. 추가 정보</h2>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              placeholder="의사선생님께 알려드리고 싶은 내용을 자유롭게 작성해주세요. 예) 수면치료를 받고 싶어요."
              className="w-full p-5 text-xl bg-gray-700 border-2 border-gray-600 
                         rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 
                         h-[150px] text-white placeholder-gray-400"
            />
          </div>
        )}

        {/* Page 20: 개인정보 동의 + 제출 */}
        {currentPage === 20 && (
          <div className="form-page">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">
              19. 개인정보 수집 및 이용 동의 (선택)
            </h2>
            <div className="bg-gray-700 p-5 rounded-xl border border-gray-600 mb-6 text-lg leading-relaxed h-[250px] overflow-y-auto text-gray-300">
              본 치과의원은 의료법 및 개인정보보호법에 따라 환자의 개인정보를 수집·이용하고 있습니다.
              <br />
              <br />
              1. 수집항목: 성명, 주민등록번호, 연락처, 주소, 의료정보 등
              <br />
              2. 수집목적: 진료서비스 제공 및 진료비 청구 등
              <br />
              3. 보유기간: 의료법에 따라 최소 10년 보관
              <br />
              4. 동의 거부권리: 정보 제공을 거부할 권리가 있으나, 이 경우 원활한 서비스 제공이 어려울 수 있습니다.
              <br />
              5. 추가 항목 : 본인은 본 연구의 목적으로 의료영상·진료기록 등 본인의 개인정보가 익명처리 후 수집·이용되며, 
                 필요한 경우 연구 협력기관 등 제3자에게 제공될 수 있음에 동의하고, 
                 언제든 동의를 철회할 수 있으며 이 과정에서 개인정보가 관련 법령에 따라 보호됨을 확인하였습니다.
              <br />
              <br />
              위 내용을 모두 읽고 개인정보 수집·이용에 동의합니다.
            </div>
            <button
              onClick={handleConsent}
              className={`w-full py-5 text-xl font-bold rounded-xl transition-colors mb-6 ${
                formData.consent
                  ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              동의합니다
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.consent}
              className="w-full px-6 py-5 text-xl font-bold bg-cyan-600 text-white rounded-xl transition-colors hover:bg-cyan-700"
            >
              {isSubmitting ? '제출 중...' : '문진표 제출하기'}
            </button>
          </div>
        )}

        {/* 페이지 이동 버튼 */}
        <div className="flex justify-between mt-8">
          {currentPage > 1 && (
            <button
              onClick={handlePrevious}
              className="px-6 py-3 text-xl font-medium bg-gray-700 text-gray-300 
                         rounded-xl hover:bg-gray-600 transition-colors"
            >
              이전
            </button>
          )}
          {currentPage < totalPages && (
            <button
              onClick={handleNext}
              disabled={!isPageValid()}
              className={`px-6 py-3 text-xl font-medium rounded-xl transition-colors ml-auto ${
                !isPageValid()
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-cyan-600 text-white hover:bg-cyan-700'
              }`}
            >
              다음
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientQuestionnaire;
