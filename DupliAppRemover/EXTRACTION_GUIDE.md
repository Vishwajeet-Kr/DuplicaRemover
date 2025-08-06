# Code Extraction Guide

This guide explains how to extract and set up the Duplicate Application Remover project on your local machine.

## 📋 Prerequisites

Before extracting the code, ensure you have the following installed:

### For Backend (Java)
- **Java JDK 11 or higher**
  - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://openjdk.org/)
  - Verify installation: `java -version`

- **Maven 3.6 or higher**
  - Download from [Apache Maven](https://maven.apache.org/download.cgi)
  - Verify installation: `mvn -version`

### For Frontend (React)
- **Node.js 16 or higher**
  - Download from [Node.js official website](https://nodejs.org/)
  - Verify installation: `node -version`

- **npm (comes with Node.js)**
  - Verify installation: `npm -version`

## 📁 Project Structure After Extraction

After extracting, your project structure should look like this:

```
duplicate-app-remover/
├── backend/                    # Java Spring Boot backend
│   ├── src/
│   ├── pom.xml
│   └── README.md
├── frontend/                   # React TypeScript frontend
│   ├── src/
│   ├── package.json
│   └── README.md
├── README.md                   # Main project documentation
├── PROJECT_STRUCTURE.md       # Project structure guide
└── EXTRACTION_GUIDE.md        # This file
```

## 🚀 Setup Instructions

### Step 1: Extract the Code

1. **From this environment**: Copy all the files from both `backend/` and `frontend/` directories
2. **Create project directory**: 
   ```bash
   mkdir duplicate-app-remover
   cd duplicate-app-remover
   ```

### Step 2: Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Verify Maven configuration**:
   ```bash
   mvn clean compile
   ```

3. **Run the backend**:
   ```bash
   mvn spring-boot:run
   ```

4. **Verify backend is running**:
   - Open browser and go to `http://localhost:8080/api/health`
   - You should see "OK" response

### Step 3: Frontend Setup

1. **Open a new terminal** and navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Open browser and go to `http://localhost:5173`
   - You should see the Duplicate Application Remover interface

## 🔧 Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.properties` if needed:

```properties
# Server port (default: 8080)
server.port=8080

# CORS configuration for frontend
spring.web.cors.allowed-origins=http://localhost:5173

# File upload limits
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB
```

### Frontend Configuration

Edit `frontend/src/services/api.ts` if backend runs on different port:

```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

## 🧪 Testing the Setup

### Test Backend Endpoints

1. **Health Check**:
   ```bash
   curl http://localhost:8080/api/health
   ```

2. **Start a scan** (replace with actual directory path):
   ```bash
   curl -X POST http://localhost:8080/api/scan \
     -H "Content-Type: application/json" \
     -d '{"directory": "/path/to/test/directory"}'
   ```

### Test Frontend

1. Open `http://localhost:5173` in your browser
2. Enter a directory path in the scan form
3. Click "Start Scan"
4. Verify that the scan results appear

## 🛠️ Development Workflow

### Backend Development

1. **Make changes** to Java files in `backend/src/main/java/`
2. **Restart the application**:
   ```bash
   mvn spring-boot:run
   ```

### Frontend Development

1. **Make changes** to React files in `frontend/src/`
2. **Hot reload** is automatic - changes appear immediately in browser

## 📦 Building for Production

### Backend Production Build

```bash
cd backend
mvn clean package
java -jar target/duplicate-app-remover-1.0.0.jar
```

### Frontend Production Build

```bash
cd frontend
npm run build
npm run preview  # To test production build locally
```

## 🐛 Troubleshooting

### Common Backend Issues

1. **Port 8080 already in use**:
   - Change port in `application.properties`
   - Or kill process using port: `lsof -ti:8080 | xargs kill -9`

2. **Java version issues**:
   - Ensure JDK 11+ is installed and in PATH
   - Check with: `java -version`

3. **Maven issues**:
   - Clear Maven cache: `mvn clean`
   - Update dependencies: `mvn clean install`

### Common Frontend Issues

1. **Port 5173 already in use**:
   - Vite will automatically suggest another port
   - Or specify port: `npm run dev -- --port 3000`

2. **Node modules issues**:
   - Delete `node_modules` and `package-lock.json`
   - Run: `npm install`

3. **API connection issues**:
   - Verify backend is running on correct port
   - Check CORS configuration in backend
   - Verify API_BASE_URL in `frontend/src/services/api.ts`

## 📝 File Extraction Checklist

Make sure you have extracted all these key files:

### Backend Files
- [ ] `backend/pom.xml`
- [ ] `backend/src/main/java/com/duplicateremover/Application.java`
- [ ] `backend/src/main/java/com/duplicateremover/controller/FileScanController.java`
- [ ] `backend/src/main/java/com/duplicateremover/model/FileInfo.java`
- [ ] `backend/src/main/java/com/duplicateremover/model/ScanResult.java`
- [ ] `backend/src/main/java/com/duplicateremover/service/FileScanService.java`
- [ ] `backend/src/main/java/com/duplicateremover/service/FileHashService.java`
- [ ] `backend/src/main/java/com/duplicateremover/service/FileCategoryService.java`
- [ ] `backend/src/main/resources/application.properties`

### Frontend Files
- [ ] `frontend/package.json`
- [ ] `frontend/index.html`
- [ ] `frontend/vite.config.ts`
- [ ] `frontend/tailwind.config.js`
- [ ] `frontend/tsconfig.json`
- [ ] `frontend/src/App.tsx`
- [ ] `frontend/src/main.tsx`
- [ ] `frontend/src/index.css`
- [ ] `frontend/src/types/index.ts`
- [ ] `frontend/src/services/api.ts`
- [ ] All component files in `frontend/src/components/`

## 🎯 Next Steps

After successful extraction and setup:

1. **Test with real directories** containing duplicate files
2. **Customize categorization rules** in the settings panel
3. **Extend functionality** as needed for your use case
4. **Set up version control** with Git
5. **Configure CI/CD** for automated builds and deployments

## 📞 Support

If you encounter issues during extraction or setup:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Ensure file permissions are correct for the directories you want to scan
4. Check application logs for detailed error messages

The application logs will provide detailed information about any issues during startup or operation.