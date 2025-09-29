import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BaseModal from './BaseModal';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNickname?: string;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, currentNickname = '' }) => {

  const [nickname, setNickname] = useState(currentNickname);
  const [nicknameError, setNicknameError] = useState('');

  // currentNickname이 변경될 때 nickname 상태 업데이트
  React.useEffect(() => {
    setNickname(currentNickname);
  }, [currentNickname]);

  // 닉네임 유효성 검사
  const validateNickname = (value: string) => {
    if (!value.trim()) {
      setNicknameError('닉네임을 입력해주세요.');
      return false;
    }

    if (value.length < 2) {
      setNicknameError('닉네임은 2자 이상이어야 합니다.');
      return false;
    }

    if (value.length > 15) {
      setNicknameError('닉네임은 15자 이하여야 합니다.');
      return false;
    }

    setNicknameError('');
    return true;
  };

  // 수정 버튼 클릭 핸들러
  const handleSubmit = () => {
    if (!validateNickname(nickname)) {
      return;
    }

    // TODO: 백엔드 API가 완성되면 주석 해제
    alert('아직 지원하지 않는 서비스입니다.');
    return;

    // try {
    //   // 프로필 수정 API 호출
    //   await updateProfile({
    //     nickname: nickname.trim(),
    //   });
    //   
    //   alert('프로필이 수정되었습니다.');
    //   onClose();
    // } catch (error: any) {
    //   console.error('프로필 수정 실패:', error);
    //   alert('프로필 수정에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    // }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="프로필 수정">
      {/* 닉네임 입력 */}
      <div className="self-stretch flex flex-col justify-start items-start gap-3">
        <Label className="self-stretch text-white text-base font-medium leading-normal">
          닉네임
        </Label>
        <Input
          type="text"
          value={nickname}
          onChange={(e) => {
            const value = e.target.value;
            setNickname(value);
            // 사용자가 입력하기 시작하면 에러 메시지 초기화
            if (nicknameError) {
              setNicknameError('');
            }
          }}
          onBlur={() => validateNickname(nickname)}
          placeholder="닉네임을 입력하세요"
          maxLength={15}
          className="w-full h-8 px-3 py-1.5 bg-slate-800 rounded-lg text-white text-xs font-medium placeholder-slate-500 focus:bg-slate-900 focus:outline focus:outline-1 focus:outline-slate-600 focus:outline-offset-[-1px]"
          style={{ outline: '1px solid #7C7F88', outlineOffset: '-1px' }}
        />
        {nicknameError && <p className="text-red-400 text-xs mt-1">{nicknameError}</p>}
      </div>

      {/* 수정 버튼 */}
      <Button
        onClick={handleSubmit}
        variant="brand1"
        size="lg"
        className="self-stretch py-3 text-lg font-bold"
      >
        수정
      </Button>
    </BaseModal>
  );
};

export default EditProfileModal;
