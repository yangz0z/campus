package kr.campus.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.campus.domain.CertificationVO;
import kr.campus.mapper.CertificationMapper;
import lombok.Setter;
import lombok.extern.log4j.Log4j;
@Log4j
@Service
public class CertificationServiceImpl implements  CertificationService {

	@Setter(onMethod_ = @Autowired) 
	private  CertificationMapper mapper;
	@Override
	public void add(CertificationVO vo) {
		// TODO Auto-generated method stub
		mapper.add(vo);
	}

	@Override
	public int delete(CertificationVO vo) {
		// TODO Auto-generated method stub
		return mapper.delete(vo);
	}

	@Override
	public CertificationVO get(CertificationVO vo) {
		// TODO Auto-generated method stub
		return mapper.get(vo);
	}
}