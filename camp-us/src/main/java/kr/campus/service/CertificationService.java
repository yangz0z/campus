package kr.campus.service;

import kr.campus.domain.CertificationVO;

public interface CertificationService {

	// 인증난수 발생하고 데이터베이스에 넣음
	public void add(CertificationVO vo);

	// 인증하고 난후 인증이 됬다면 인증했다는 코드를 바로 삭제
	public int delete(CertificationVO vo);

	// 인증을 하기위한 코드
	public CertificationVO get(CertificationVO vo);

}