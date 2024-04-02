const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const secretKey = 'your_secret_key'; // 시크릿 키는 실제 프로덕션 환경에서는 보안상의 이유로 환경 변수 등을 통해 안전하게 관리해야 합니다.

app.use(bodyParser.json());

// 예시를 위한 사용자 데이터베이스 (실제로는 데이터베이스를 사용해야 함)
const users = [
    { id: 1, username: 'user1', password: 'password1' },
    { id: 2, username: 'user2', password: 'password2' }
];

// 로그인 엔드포인트
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // 사용자가 있는지 확인
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // JWT 토큰 생성
        const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
        
        res.json({
            success: true,
            message: 'Login successful',
            token: token
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }
});

// 보호된 엔드포인트
app.get('/protected', verifyToken, (req, res) => {
    // 토큰 검증 후 사용자 정보를 얻어올 수 있음
    const userId = req.userId;

    // 여기서는 간단하게 userId를 응답으로 보냄
    res.json({
        success: true,
        message: 'Protected endpoint',
        userId: userId
    });
});

// JWT 토큰 검증 미들웨어
function verifyToken(req, res, next) {
    // 헤더에서 토큰 가져오기
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        // Bearer 다음의 토큰 부분만 가져옴
        const bearerToken = bearerHeader.split(' ')[1];

        // 토큰 설정
        req.token = bearerToken;

        // 토큰 검증
        jwt.verify(req.token, secretKey, (err, authData) => {
            if (err) {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden'
                });
            } else {
                // 검증 성공시 요청에 사용자 ID 추가
                req.userId = authData.userId;
                next();
            }
        });
    } else {
        // 헤더가 없으면 에러
        res.status(401).json({
            success: false,
            message: 'Unauthorized'
        });
    }
}

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});