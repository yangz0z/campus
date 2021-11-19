package kr.icia.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.icia.domain.BoardAttachVO;
import kr.icia.domain.BoardVO;
import kr.icia.domain.Criteria;
import kr.icia.mapper.BoardAttachMapper;
import kr.icia.mapper.BoardMapper;
import kr.icia.mapper.ReplyMapper;
import lombok.Setter;
import lombok.extern.log4j.Log4j;

@Log4j
@Service
//@AllArgsConstructor
public class BoardServiceImp implements BoardService {

	@Setter(onMethod_ = @Autowired)
	private BoardMapper mapper;

	@Setter(onMethod_ = @Autowired)
	private BoardAttachMapper attachMapper;

	@Setter(onMethod_ = @Autowired)
	private ReplyMapper replyMapper;

	@Transactional
	@Override
	public void register(BoardVO board) {
		log.info("register......" + board);
		mapper.insertSelectKey(board);

		if (board.getAttachList() == null || board.getAttachList().size() <= 0) {
			return;
		}

		board.getAttachList().forEach(attach -> {
			attach.setBno(board.getBno());
			attachMapper.insert(attach);
		});
	}

	@Override
	public BoardVO get(Long bno) {
		log.info("get......" + bno);
		return mapper.read(bno);
	}

	@Transactional
	@Override
	public boolean modify(BoardVO board) {
		log.info("modify......" + board);
		
		boolean modifyResult = false;
		modifyResult = mapper.update(board) ==1;
		
		int attachList = 0;
		if (board.getAttachList() != null) {
			attachList = board.getAttachList().size();
		}
		if (modifyResult && attachList > 0) {
			List<BoardAttachVO> inputList = board.getAttachList();
			List<BoardAttachVO> dbList = attachMapper.findByBno(board.getBno());
			
			for (BoardAttachVO bav : inputList) {
				boolean flag = false;
				
				for (BoardAttachVO bav2 : dbList) {
					if (bav.getFileName().equals(bav2.getFileName())) {
						flag = true;
					}
				}
				
				if (!flag) {
					bav.setBno(board.getBno());
					attachMapper.insert(bav);
				}
			}
		}
		return modifyResult;
	}

	
	@Transactional
	@Override
	public boolean remove(Long bno) {
		log.info("remove......" + bno);
		attachMapper.deleteAll(bno);
		replyMapper.deleteAll(bno);
		return mapper.delete(bno) == 1;
	}

//	@Override
//	public List<BoardVO> getList() {
//		log.info("getList......");
//		return mapper.getList();
//	}

	@Override
	public List<BoardVO> getList(Criteria cri) {
		log.info("getListWithPaging......" + cri);
		return mapper.getListWithPaging(cri);
	}

	@Override
	public int getTotal(Criteria cri) {
		log.info("get total count");
		return mapper.getTotalCount(cri);
	}

	@Override
	public List<BoardAttachVO> getAttachList(Long bno) {
		log.info("get Attach list by bno: " + bno);
		return attachMapper.findByBno(bno);
	}

}
