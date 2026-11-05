/**
 * GOOGLE APPS SCRIPT - SỔ CÔNG TÁC CÁ NHÂN & STORAGE GOOGLE DRIVE 5TB
 * 
 * Hệ thống Serverless 0đ:
 * - Google Sheets: Lưu trữ Database danh sách công việc, lịch trình, báo cáo
 * - Google Drive: Lưu trữ hình ảnh minh chứng theo cấu trúc phân hệ và Năm-Tháng
 * 
 * Hướng dẫn triển khai xem file README.md cùng thư mục.
 */

// Cấu hình tên thư mục gốc và file Sheet
var CONFIG = {
  ROOT_FOLDER_NAME: "So_Cong_Tac_Ca_Nhan",
  SPREADSHEET_NAME: "So_Cong_Tac_Database",
  CATEGORY_FOLDERS: {
    "doan_thanh_nien": "01_Doan_Thanh_Nien",
    "antt_co_so": "02_ANTT_Co_So",
    "cong_viec_khac": "03_Cong_Viec_Khac"
  }
};

/**
 * Xử lý GET request
 */
function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = params.action || "ping";

    if (action === "ping") {
      return jsonResponse({
        success: true,
        message: "Kết nối Google Apps Script API thành công!",
        serverTime: new Date().toISOString()
      });
    }

    if (action === "getItems") {
      var items = getAllWorkItems();
      return jsonResponse({
        success: true,
        items: items
      });
    }

    return jsonResponse({
      success: false,
      error: "Hành động không hợp lệ: " + action
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.toString()
    });
  }
}

/**
 * Xử lý POST request
 */
function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      throw new Error("Không nhận được dữ liệu POST");
    }

    var action = data.action;

    // 1. Upload ảnh lên Google Drive
    if (action === "uploadImage") {
      var result = saveImageToDrive(
        data.base64,
        data.fileName || "image_" + new Date().getTime() + ".jpg",
        data.category || "cong_viec_khac",
        data.yearMonth || Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM")
      );
      return jsonResponse({
        success: true,
        data: result
      });
    }

    // 2. Lưu hoặc Cập nhật 1 công việc
    if (action === "saveItem") {
      var saved = saveOrUpdateWorkItem(data.item);
      return jsonResponse({
        success: true,
        item: saved
      });
    }

    // 3. Xóa 1 công việc
    if (action === "deleteItem") {
      deleteWorkItemById(data.id);
      return jsonResponse({
        success: true,
        id: data.id
      });
    }

    // 4. Đồng bộ hàng loạt (Batch Sync)
    if (action === "batchSync") {
      syncAllItems(data.items || []);
      return jsonResponse({
        success: true,
        count: (data.items || []).length
      });
    }

    return jsonResponse({
      success: false,
      error: "Hành động POST không xác định: " + action
    });

  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.toString()
    });
  }
}

/**
 * Tạo phản hồi JSON chuẩn có hỗ trợ CORS
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Tìm hoặc tạo thư mục theo tên bên trong một thư mục cha
 */
function getOrCreateFolder(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

/**
 * Tự động tạo cây thư mục trên Google Drive và lưu ảnh
 * Cấu trúc: So_Cong_Tac_Ca_Nhan / [01_Doan_Thanh_Nien | ...] / [YYYY-MM]
 */
function saveImageToDrive(base64Data, fileName, category, yearMonth) {
  var rootFolders = DriveApp.getFoldersByName(CONFIG.ROOT_FOLDER_NAME);
  var rootFolder = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder(CONFIG.ROOT_FOLDER_NAME);

  var subFolderName = CONFIG.CATEGORY_FOLDERS[category] || CONFIG.CATEGORY_FOLDERS["cong_viec_khac"];
  var catFolder = getOrCreateFolder(rootFolder, subFolderName);

  var ymFolder = getOrCreateFolder(catFolder, yearMonth);

  // Tách base64 data URL nếu có
  var cleanBase64 = base64Data;
  var mimeType = "image/jpeg";
  if (base64Data.indexOf(";base64,") !== -1) {
    var parts = base64Data.split(";base64,");
    mimeType = parts[0].replace("data:", "");
    cleanBase64 = parts[1];
  }

  var decodedBytes = Utilities.base64Decode(cleanBase64);
  var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
  var file = ymFolder.createFile(blob);

  // Cấp quyền xem cho người có link để app hiển thị trực tiếp
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var fileId = file.getId();
  var directUrl = "https://lh3.googleusercontent.com/d/" + fileId;
  var downloadUrl = "https://drive.google.com/uc?export=view&id=" + fileId;

  return {
    id: fileId,
    fileId: fileId,
    url: directUrl,
    viewUrl: file.getUrl(),
    downloadUrl: downloadUrl,
    name: fileName,
    folderPath: CONFIG.ROOT_FOLDER_NAME + "/" + subFolderName + "/" + yearMonth
  };
}

/**
 * Tìm hoặc khởi tạo Google Sheet Database
 */
function getDatabaseSheet() {
  var ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    // Nếu script đứng độc lập
  }

  if (!ss) {
    var files = DriveApp.getFilesByName(CONFIG.SPREADSHEET_NAME);
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
      // Di chuyển vào thư mục gốc So_Cong_Tac_Ca_Nhan
      var rootFolders = DriveApp.getFoldersByName(CONFIG.ROOT_FOLDER_NAME);
      var root = rootFolders.hasNext() ? rootFolders.next() : DriveApp.createFolder(CONFIG.ROOT_FOLDER_NAME);
      var file = DriveApp.getFileById(ss.getId());
      root.addFile(file);
      DriveApp.getRootFolder().removeFile(file);
    }
  }

  var sheet = ss.getSheetByName("WorkItems");
  if (!sheet) {
    sheet = ss.insertSheet("WorkItems");
    var headers = [
      "id",
      "title",
      "category",
      "type",
      "status",
      "date",
      "time",
      "location",
      "description",
      "imagesJson",
      "isHighlighted",
      "createdAt",
      "updatedAt"
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0066FF").setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Lấy toàn bộ danh sách công việc
 */
function getAllWorkItems() {
  var sheet = getDatabaseSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, 13).getValues();
  var items = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    if (!row[0]) continue;

    var images = [];
    try {
      if (row[9]) {
        images = JSON.parse(row[9]);
      }
    } catch (e) {
      images = [];
    }

    items.push({
      id: String(row[0]),
      title: String(row[1] || ""),
      category: String(row[2] || "cong_viec_khac"),
      type: String(row[3] || "completed_log"),
      status: String(row[4] || "done"),
      date: formatDateToISO(row[5]),
      time: String(row[6] || ""),
      location: String(row[7] || ""),
      description: String(row[8] || ""),
      images: images,
      isHighlighted: Boolean(row[10]),
      createdAt: String(row[11] || ""),
      updatedAt: String(row[12] || "")
    });
  }

  return items;
}

/**
 * Chuẩn hóa ngày thành định dạng YYYY-MM-DD
 */
function formatDateToISO(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, "GMT+7", "yyyy-MM-dd");
  }
  return String(val);
}

/**
 * Lưu hoặc cập nhật 1 WorkItem
 */
function saveOrUpdateWorkItem(item) {
  if (!item || !item.id) throw new Error("WorkItem không có ID");

  var sheet = getDatabaseSheet();
  var lastRow = sheet.getLastRow();
  var rowIndex = -1;

  if (lastRow > 1) {
    var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(item.id)) {
        rowIndex = i + 2;
        break;
      }
    }
  }

  var rowData = [
    item.id,
    item.title || "",
    item.category || "cong_viec_khac",
    item.type || "completed_log",
    item.status || "done",
    item.date || "",
    item.time || "",
    item.location || "",
    item.description || "",
    JSON.stringify(item.images || []),
    item.isHighlighted ? true : false,
    item.createdAt || new Date().toISOString(),
    new Date().toISOString()
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return item;
}

/**
 * Xóa 1 WorkItem theo ID
 */
function deleteWorkItemById(id) {
  if (!id) return;
  var sheet = getDatabaseSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
      break;
    }
  }
}

/**
 * Đồng bộ toàn bộ dữ liệu (ghi đè hoặc cập nhật)
 */
function syncAllItems(items) {
  var sheet = getDatabaseSheet();
  sheet.clearContents();

  var headers = [
    "id",
    "title",
    "category",
    "type",
    "status",
    "date",
    "time",
    "location",
    "description",
    "imagesJson",
    "isHighlighted",
    "createdAt",
    "updatedAt"
  ];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0066FF").setFontColor("#FFFFFF");
  sheet.setFrozenRows(1);

  if (!items || items.length === 0) return;

  var rows = [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i];
    rows.push([
      it.id,
      it.title || "",
      it.category || "cong_viec_khac",
      it.type || "completed_log",
      it.status || "done",
      it.date || "",
      it.time || "",
      it.location || "",
      it.description || "",
      JSON.stringify(it.images || []),
      it.isHighlighted ? true : false,
      it.createdAt || new Date().toISOString(),
      it.updatedAt || new Date().toISOString()
    ]);
  }

  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

