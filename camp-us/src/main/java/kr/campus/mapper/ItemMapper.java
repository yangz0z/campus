package kr.campus.mapper;

import java.util.List;

import kr.campus.domain.ItemVO;

public interface ItemMapper {
	public List<ItemVO> itemList(); //전체상품 목록보기
	//이후 Criteria를 이용해서 페이징처리 해야함
	
	public ItemVO readItem(int itemCode); //상품 상세페이지
	
	public List<ItemVO> hotList(); //인기상품
	
	public List<ItemVO> newList(); //신상품
	
	public int getTotal(); //상품 총 개수 파악
}
