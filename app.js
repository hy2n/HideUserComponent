const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 15390;
const path = require('path');
const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true})) 


const JWT_SECRET = 'your_jwt_secret_here'; // JWT 시크릿 키

app.use(cookieParser()); // cookie-parser 미들웨어 사용
app.use(express.json()); // JSON 파싱 미들웨어

app.get('/authenticate', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auth.html'));
});


function sendFileIfExists(req, res, next) {
    const file = req.params.file;
    const filePath = path.join(__dirname, 'private', file);
    // 파일이 존재하는지 확인
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send('File not found');
        }
        // 파일이 존재하면 제공
        res.sendFile(filePath);
    });
}

app.get('/', authenticateJWT, sendFileIfExists); //수정필요
app.get('/web/:file', authenticateJWT, sendFileIfExists);
app.get('/:file', authenticateJWT, sendFileIfExists);
app.get('/:file', authenticateJWT, sendFileIfExists);

// authAPI: 사용자 인증
app.post('/authAPI', (req, res) => {
    // 예시: 실제 프로젝트에서는 데이터베이스를 사용하여 사용자를 확인합니다.
    const Mykey = req.body;
    // 예시: 사용자가 올바른 자격 증명을 제공했다고 가정합니다.
    if (Mykey.Mykey === 'password') {
        // 사용자 정보
        const user = {
            username: 'User',
            role: 'Viewer' // 사용자 역할
        };

        // JWT 생성
        jwt.sign(user, JWT_SECRET, (err, token) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to generate token' });
            }
            // 쿠키에 토큰 설정 (예: 만료일 설정 등은 필요에 따라 추가 가능)
            res.cookie('token', token, { httpOnly: true }).sendStatus(200);
        });
    } else {
        res.status(401).json({ error: Mykey });
    }
});

// 미들웨어: JWT 검증
function authenticateJWT(req, res, next) {
    const token = req.cookies.token;

    // 토큰이 없는 경우
    if (!token) {
        // 요청한 경로가 /authenticate인 경우 다음 미들웨어로 진행
        if (req.path === '/authenticate' || req.path === '/authAPI') {
            return next();
        }
        return res.redirect('/authenticate');
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            // 토큰이 유효하지 않은 경우
            return res.redirect('/authenticate');
        }
        req.user = decoded;
        next();
    });
}

app.listen(port, () => {
    console.log('server started');
});
