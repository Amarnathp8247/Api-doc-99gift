import { Component, AfterViewInit } from '@angular/core';
import { SidebarComponent } from "../../layouts/sidebar/sidebar.component";
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import CryptoJS from 'crypto-js';

import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import php from 'highlight.js/lib/languages/php';
import java from 'highlight.js/lib/languages/java';

@Component({
  selector: 'app-voucher-status',
  imports: [CommonModule, FormsModule, HttpClientModule, SidebarComponent],
  templateUrl: './voucher-status.component.html',
  styleUrl: './voucher-status.component.scss'
})
export class VoucherStatusComponent {



// Tab management
activeTab: string = 'encryption-js';
activeEndpointTab: { [key: string]: string } = {};

// Code examples
codeExamples = {
encryption: {
  js: `// Using crypto-js library
const CryptoJS = require('crypto-js');

// Configuration - these should come from environment variables in production
const SECRET_KEY = '12345678901234567890123456789012'; // 32 chars
const IV = '1234567890123456'; // 16 chars

function encryptData(data) {
// Convert key and IV to CryptoJS format
const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
const iv = CryptoJS.enc.Utf8.parse(IV);

// Stringify if data is an object
const text = typeof data === 'string' ? data : JSON.stringify(data);

// Encrypt using AES-256-CBC
const encrypted = CryptoJS.AES.encrypt(text, key, {
iv: iv,
mode: CryptoJS.mode.CBC,
padding: CryptoJS.pad.Pkcs7
});

return encrypted.toString();
}

// Example usage:
const orderData = {
productId: 694,
walletPayment: true,
emailID: "test@99gift.in",
mobileNo: "9182XXXXX94",
customerName: "Test",
denominations: [{
amount: 10,
corp_discount: 3,
quantity: 1,
product_id: "694",
subproduct_id: 1737,
PRODUCTCODE: "GOOL10",
ProductGuid: "GOOL10",
skuID: "OFFGOOGLENW"
}]
};

const encryptedPayload = {
data: encryptData(orderData)
};

console.log("Encrypted Payload:", encryptedPayload);`,
  python: `from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
import base64
import json

# Configuration - use environment variables in production
SECRET_KEY = '12345678901234567890123456789012'  # 32 bytes
IV = '1234567890123456'  # 16 bytes

def encrypt_data(data):
if isinstance(data, dict):
    text = json.dumps(data)
else:
    text = str(data)

cipher = AES.new(SECRET_KEY.encode('utf-8'), AES.MODE_CBC, IV.encode('utf-8'))
padded_data = pad(text.encode('utf-8'), AES.block_size)
encrypted = cipher.encrypt(padded_data)

return base64.b64encode(encrypted).decode('utf-8')

order_data = {
"productId": 694,
"walletPayment": True,
"emailID": "test@99gift.in",
"mobileNo": "9182XXXXX94",
"customerName": "Test",
"denominations": [{
    "amount": 10,
    "corp_discount": 3,
    "quantity": 1,
    "product_id": "694",
    "subproduct_id": 1737,
    "PRODUCTCODE": "GOOL10",
    "ProductGuid": "GOOL10",
    "skuID": "OFFGOOGLENW"
}]
}

encrypted_payload = {
"data": encrypt_data(order_data)
}

print("Encrypted Payload:", encrypted_payload)`,
  php: `<?php
function encryptData($data, $key, $iv) {
if (is_array($data)) {
    $text = json_encode($data);
} else {
    $text = (string)$data;
}

$blockSize = 16;
$pad = $blockSize - (strlen($text) % $blockSize);
$text = $text . str_repeat(chr($pad), $pad);

$encrypted = openssl_encrypt(
    $text,
    'AES-256-CBC',
    $key,
    OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING,
    $iv
);

return base64_encode($encrypted);
}

$secretKey = '12345678901234567890123456789012';
$iv = '1234567890123456';

$orderData = [
'productId' => 694,
'walletPayment' => true,
'emailID' => 'test@99gift.in',
'mobileNo' => '9182XXXXX94',
'customerName' => 'Test',
'denominations' => [[
    'amount' => 10,
    'corp_discount' => 3,
    'quantity' => 1,
    'product_id' => '694',
    'subproduct_id' => 1737,
    'PRODUCTCODE' => 'GOOL10',
    'ProductGuid' => 'GOOL10',
    'skuID' => 'OFFGOOGLENW'
]]
];

$encryptedPayload = [
'data' => encryptData($orderData, $secretKey, $iv)
];

echo "Encrypted Payload: ";
print_r($encryptedPayload);
?>`,
  java: `import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.json.JSONObject;

public class CryptoUtils {

private static final String ALGORITHM = "AES/CBC/PKCS5Padding";

public static String encryptData(String data, String key, String iv) throws Exception {
    SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "AES");
    IvParameterSpec ivSpec = new IvParameterSpec(iv.getBytes(StandardCharsets.UTF_8));
    
    Cipher cipher = Cipher.getInstance(ALGORITHM);
    cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);
    
    byte[] encrypted = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
    
    return Base64.getEncoder().encodeToString(encrypted);
}

public static void main(String[] args) {
    try {
        String secretKey = "12345678901234567890123456789012";
        String iv = "1234567890123456";

        JSONObject orderData = new JSONObject();
        orderData.put("productId", 694);
        orderData.put("walletPayment", true);
        orderData.put("emailID", "test@99gift.in");
        orderData.put("mobileNo", "9182XXXXX94");
        orderData.put("customerName", "Test");

        JSONObject denomination = new JSONObject();
        denomination.put("amount", 10);
        denomination.put("corp_discount", 3);
        denomination.put("quantity", 1);
        denomination.put("product_id", "694");
        denomination.put("subproduct_id", 1737);
        denomination.put("PRODUCTCODE", "GOOL10");
        denomination.put("ProductGuid", "GOOL10");
        denomination.put("skuID", "OFFGOOGLENW");

        orderData.put("denominations", new JSONObject[] {denomination});

        String encryptedData = encryptData(orderData.toString(), secretKey, iv);

        JSONObject encryptedPayload = new JSONObject();
        encryptedPayload.put("data", encryptedData);

        System.out.println("Encrypted Payload: " + encryptedPayload.toString());
    } catch (Exception e) {
        e.printStackTrace();
    }
}
}`
},
login: {
  curl: `curl -X POST \\
'https://api.99gift.in/user/login-Corporate/merchant' \\
-H 'Content-Type: application/json' \\
-d '{
"mobile": "9182XXXXX94",
"password": "test@123",
"authcode": "128636"
}'`,
  js: `// Using Fetch API
const loginData = {
mobile: "9182XXXXX94",
password: "test@123",
authcode: "128636"
};

fetch('https://api.99gift.in/user/login-Corporate/merchant', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify(loginData)
})
.then(response => response.json())
.then(data => {
console.log('Login successful:', data);
// Store the JWT token for future requests
localStorage.setItem('jwtToken', data.data);
})
.catch(error => console.error('Error:', error));`,
  python: `import requests

login_data = {
"mobile": "9182XXXXX94",
"password": "test@123",
"authcode": "128636"
}

response = requests.post(
"https://api.99gift.in/user/login-Corporate/merchant",
json=login_data,
headers={"Content-Type": "application/json"}
)

if response.status_code == 200:
print("Login successful:", response.json())
jwt_token = response.json().get("data")
# Store the JWT token for future requests
else:
print("Login failed:", response.text)`,
  php: `<?php
$loginData = [
'mobile' => '9182XXXXX94',
'password' => 'test@123',
'authcode' => '128636'
];

$options = [
'http' => [
    'header' => "Content-Type: application/json\r\n",
    'method' => 'POST',
    'content' => json_encode($loginData)
]
];

$context = stream_context_create($options);
$response = file_get_contents(
'https://api.99gift.in/user/login-Corporate/merchant', 
false, 
$context
);

if ($response !== false) {
$responseData = json_decode($response, true);
echo "Login successful: ";
print_r($responseData);
// Store JWT token for future requests
$_SESSION['jwtToken'] = $responseData['data'];
} else {
echo "Login failed";
}
?>`
},
profile: {
  curl: `curl -X GET \\
'https://api.99gift.in/user/validate-token' \\
-H 'Authorization: Bearer YOUR_JWT_TOKEN'`,
  js: `// Using Fetch API with JWT from localStorage
const jwtToken = localStorage.getItem('jwtToken');

fetch('https://api.99gift.in/user/validate-token', {
method: 'GET',
headers: {
'Authorization': \`Bearer \${jwtToken}\`
}
})
.then(response => response.json())
.then(data => console.log('Profile data:', data))
.catch(error => console.error('Error:', error));`,
  python: `import requests

jwt_token = "YOUR_JWT_TOKEN"  # Replace with actual token

response = requests.get(
"https://api.99gift.in/user/validate-token",
headers={"Authorization": f"Bearer {jwt_token}"}
)

if response.status_code == 200:
print("Profile data:", response.json())
else:
print("Error:", response.text)`
}
};
// Encryption demo
encryptionResult: string = '';
showEncryptionResult: boolean = false;
encryptionInput: any = {
  productId: 694,
  walletPayment: true,
  emailID: "test@99gift.in",
  mobileNo: "9182XXXXX94",
  customerName: "Test",
  denominations: [{
    amount: 10,
    corp_discount: 3,
    quantity: 1,
    product_id: "694",
    subproduct_id: 1737,
    PRODUCTCODE: "GOOL10",
    ProductGuid: "GOOL10",
    skuID: "OFFGOOGLENW"
  }]
};

// API demo
apiResponses: { [key: string]: any } = {};
executingCode: boolean = false;
demoCredentials = {
  mobile: '9182XXXXX94',
  password: 'test@123',
  authcode: '128636'
};

// Encryption settings
encryptionConfig = {
  secretKey: '12345678901234567890123456789012',
  iv: '1234567890123456'
};



constructor(
  private http: HttpClient,
  private sanitizer: DomSanitizer
) {
  // Initialize active tabs for each endpoint
  this.endpoints.forEach(endpoint => {
    this.activeEndpointTab[endpoint.id] = `${endpoint.id}-curl`;
  });
  
  // Register languages for syntax highlighting
  hljs.registerLanguage('javascript', javascript);
  hljs.registerLanguage('python', python);
  hljs.registerLanguage('php', php);
  hljs.registerLanguage('java', java);
}

// Sample data for the documentation
endpoints = [
  { id: 'login', title: 'Login API', method: 'POST', path: '/user/login-Corporate/merchant' },
  { id: 'profile', title: 'Profile API', method: 'GET', path: '/user/validate-token' },
  { id: 'product-list', title: 'Product List API', method: 'GET', path: '/list' },
  { id: 'order-place', title: 'Order Place API', method: 'PUT', path: '/gift/order-create-corporate' }
];

ngAfterViewInit() {
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block as HTMLElement);
  });
}

// Tab management methods
setActiveTab(tabId: string): void {
  this.activeTab = tabId;
}

setEndpointActiveTab(endpointId: string, tabId: string): void {
  this.activeEndpointTab[endpointId] = tabId;
}

isActiveTab(tabId: string): boolean {
  return this.activeTab === tabId;
}

isEndpointActiveTab(endpointId: string, tabId: string): boolean {
  return this.activeEndpointTab[endpointId] === tabId;
}

// Encryption methods
encryptData(data: any): string {
  const key = CryptoJS.enc.Utf8.parse(this.encryptionConfig.secretKey);
  const iv = CryptoJS.enc.Utf8.parse(this.encryptionConfig.iv);

  const text = typeof data === 'string' ? data : JSON.stringify(data);

  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return encrypted.toString();
}

runEncryptionDemo(): void {
  try {
    const encrypted = this.encryptData(this.encryptionInput);
    this.encryptionResult = JSON.stringify({ data: encrypted }, null, 2);
    this.showEncryptionResult = true;
  } catch (error) {
    this.encryptionResult = `Encryption error: ${error}`;
    this.showEncryptionResult = true;
  }
}

// API demo methods
tryApiRequest(endpointId: string): void {
  this.executingCode = true;
  this.apiResponses[endpointId] = 'Executing...';

  setTimeout(() => {
    switch (endpointId) {
      case 'login':
        this.mockLoginRequest();
        break;
      case 'profile':
        this.mockProfileRequest();
        break;
      case 'product-list':
        this.mockProductListRequest();
        break;
      case 'order-place':
        this.mockOrderPlaceRequest();
        break;
    }
    this.executingCode = false;
  }, 1500);
}

private mockLoginRequest(): void {
  if (this.demoCredentials.mobile === '9182XXXXX94' && 
      this.demoCredentials.password === 'test@123' && 
      this.demoCredentials.authcode === '128636') {
    this.apiResponses['login'] = {
      status: true,
      message: "Login Success!",
      data: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NTEyODI4NzAsIm5iZiI6MTc1",
      user_detail: {
        id: 188699,
        email: "corptest@99gift.in",
        mobile: "9182XXXXX94",
        balance: 180.6,
        name: "Test"
      },
      pagination: null
    };
  } else {
    this.apiResponses['login'] = {
      status: false,
      message: "Invalid credentials or 2FA code",
      data: null
    };
  }
}

private mockProfileRequest(): void {
  this.apiResponses['profile'] = {
    status: true,
    message: "User details!",
    data: {
      id: 188699,
      name: "Amarnath",
      mobile: "9182XXXXX94",
      email: "corptest@99gift.in",
      balance: 180.6,
      corporate_name: null,
      pin_code: null
    }
  };
}

private mockProductListRequest(): void {
  this.apiResponses['product-list'] = {
    status: true,
    message: "Card's List New!",
    data: [
      {
        id: 694,
        sku: "OFFGOOGLENW",
        title: "Google Play E-Gift Voucher",
        image: "https://99paisa.s3.amazonaws.com/fund--request/cQXcnF2zu4BXaWaD7UWXG3y5bZ7Ld5RmIgL13k2p.jpg",
        website: 1,
        store: 0,
        min_price: 10,
        max_price: 50,
        discount_type: "percentage",
        points: 0,
        corp_discount: 3,
        category: {
          id: 6,
          title: "Entertainment",
          status: 1
        }
      }
    ],
    pagination: {
      page: 1,
      rowsPerPage: 100,
      sortBy: "display",
      descending: false,
      total: 0
    }
  };
}

private mockOrderPlaceRequest(): void {
  this.apiResponses['order-place'] = {
    status: true,
    message: "Order Processed Successful! Please Check Report!",
    data: {
      orderId: "ZPXXXX120",
      gateway: false,
      totalAmount: 9.7,
      walletPaid: 9.7,
      product_info: null
    },
    pagination: null
  };
}

copyCode(elementId: string): void {
  const codeBlock = document.getElementById(elementId);
  if (codeBlock) {
    const range = document.createRange();
    range.selectNode(codeBlock);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    document.execCommand('copy');
    window.getSelection()?.removeAllRanges();

    const copyButton = document.querySelector(`[data-copy="${elementId}"]`);
    if (copyButton) {
      const originalText = copyButton.textContent;
      copyButton.textContent = 'Copied!';
      setTimeout(() => {
        if (copyButton) copyButton.textContent = originalText;
      }, 2000);
    }
  }
}

formatJson(json: any): SafeHtml {
  if (typeof json === 'string') {
    try {
      json = JSON.parse(json);
    } catch (e) {
      return this.sanitizer.bypassSecurityTrustHtml(json);
    }
  }
  const formatted = JSON.stringify(json, null, 2)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
      let cls = 'token number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'token key';
        } else {
          cls = 'token string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'token boolean';
      } else if (/null/.test(match)) {
        cls = 'token null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
  return this.sanitizer.bypassSecurityTrustHtml(formatted);
}
}



