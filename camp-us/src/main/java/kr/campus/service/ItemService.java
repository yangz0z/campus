package kr.campus.service;

import java.util.List;

import kr.campus.domain.Criteria;
import kr.campus.domain.ItemVO;

public interface ItemService {

	public List<ItemVO> itemList(Criteria cri); //전체상품 목록보기
	
	public ItemVO readItem(String itemCode); //상품 상세페이지
	
	public List<ItemVO> recommendedItems(); //추천아이템
	
	public List<ItemVO> newList(Criteria cri); //신상품
	
	public int getTotal(Criteria cri); //상품 총 개수 파악

}
