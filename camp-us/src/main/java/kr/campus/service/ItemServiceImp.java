package kr.campus.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.campus.domain.ItemVO;
import kr.campus.mapper.ItemMapper;
import lombok.AllArgsConstructor;
import lombok.Setter;
import lombok.extern.log4j.Log4j;

@Log4j
@Service
@AllArgsConstructor
public class ItemServiceImp implements ItemService {
	@Setter(onMethod_ = @Autowired)
	private ItemMapper mapper;

	@Override
	public List<ItemVO> itemList() {
		log.info("get item list......");
		return mapper.itemList();
	}

	@Override
	public ItemVO readItem(int itemCode) {
		log.info("read item......" + itemCode);
		return mapper.readItem(itemCode);
	}

	@Override
	public List<ItemVO> hotList() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<ItemVO> newList() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public int getTotal() {
		// TODO Auto-generated method stub
		return 0;
	}

}
