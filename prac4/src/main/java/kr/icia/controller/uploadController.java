package kr.icia.controller;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import kr.icia.domain.AttachFileDTO;
import kr.icia.mapper.BoardAttachMapper;
import lombok.Setter;
import lombok.extern.log4j.Log4j;

@Controller
@Log4j
public class uploadController {

	String uploadFolder = "c:\\upload";
	
	@Setter(onMethod_ = @Autowired)
	private BoardAttachMapper attachMapper;
	
	@PostMapping(value="/uploadAjaxAction", produces=MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<List<AttachFileDTO>> uploadAjaxPost(MultipartFile[] uploadFile) {
		List<AttachFileDTO> list = new ArrayList<>();

		String uploadFolderPath = getFolder();
		File uploadPath = new File(uploadFolder, uploadFolderPath);
		
		if (uploadPath.exists() == false) {
			uploadPath.mkdirs();
		}
		
		for (MultipartFile multipartFile : uploadFile) {
			AttachFileDTO attachDTO = new AttachFileDTO();
			String uploadFileName = multipartFile.getOriginalFilename();
			
			//익스플로러용 처리
			uploadFileName = uploadFileName.substring(uploadFileName.lastIndexOf("\\") + 1);
			
			attachDTO.setFileName(uploadFileName);
			
			UUID uuid = UUID.randomUUID();
			
			uploadFileName = uuid.toString() + "_" + uploadFileName;
			
			try {
				File saveFile = new File(uploadPath, uploadFileName);
				multipartFile.transferTo(saveFile);
				
				attachDTO.setUuid(uuid.toString());
				attachDTO.setUploadPath(uploadFolderPath);
				
				list.add(attachDTO);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		return new ResponseEntity<>(list, HttpStatus.OK);
	}

	private String getFolder() {
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		Date date = new Date();
		String str = sdf.format(date);
		return str.replace("-", File.separator);
	}
	
	@PostMapping("/deleteFile")
	@ResponseBody
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<String> deleteFile(String fileName, String type) {
		log.info("deleteFile: " + fileName);
		File file;
		try {
			fileName = URLDecoder.decode(fileName, "UTF-8");
			file = new File("c:\\upload\\" + fileName);
			
			fileName = fileName.substring(fileName.indexOf("/") + 1, fileName.indexOf("_"));
			log.info("uuid: " + fileName);
			attachMapper.delete(fileName);
			file.delete();
			
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		return new ResponseEntity<String>("deleted", HttpStatus.OK);
	}
	
	@GetMapping(value="/download", produces=MediaType.APPLICATION_OCTET_STREAM_VALUE)
	@ResponseBody
	public ResponseEntity<Resource> downloadFile(@RequestHeader("User-Agent") String userAgent, String fileName) {
		Resource resource = new FileSystemResource("c:\\upload\\" + fileName);
		log.info("resource: " + resource);
		
		if(resource.exists() == false) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
		
		String resourceName = resource.getFilename();
		String resourceOriginalName = resourceName.substring(resourceName.indexOf("_")+1);
		
		HttpHeaders headers = new HttpHeaders();
		
		try {
			String downloadName = null;
			
			if (userAgent.contains("Trident")) {
				log.info("IE browser");
				downloadName = URLEncoder.encode(resourceOriginalName, "UTF-8").replaceAll("\\", " ");
			} else if (userAgent.contains("Edge")) {
				log.info("Edge browser");
				downloadName = URLEncoder.encode(resourceOriginalName, "UTF-8");
			} else {
				log.info("Chrome browser");
				downloadName = new String(resourceOriginalName.getBytes("UTF-8"), "ISO-8859-1");
			}
			log.info("downloadName: " + downloadName);
			headers.add("Content-disposition", "attachment; filename=" + downloadName);
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		return new ResponseEntity<Resource>(resource, headers, HttpStatus.OK);
	}
}
