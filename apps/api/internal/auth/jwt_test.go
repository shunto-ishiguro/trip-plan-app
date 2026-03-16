package auth

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const testSecret = "test-secret-key-for-unit-tests"

func createToken(t *testing.T, secret string, claims JWTPayload) string {
	t.Helper()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		t.Fatalf("failed to sign token: %v", err)
	}
	return signed
}

func TestVerify_ValidToken(t *testing.T) {
	v := NewJWTVerifier(testSecret)

	tokenStr := createToken(t, testSecret, JWTPayload{
		Sub:   "user-123",
		Email: "test@example.com",
		Role:  "authenticated",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	})

	payload, err := v.Verify(tokenStr)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if payload.Sub != "user-123" {
		t.Errorf("expected sub=user-123, got %s", payload.Sub)
	}
	if payload.Email != "test@example.com" {
		t.Errorf("expected email=test@example.com, got %s", payload.Email)
	}
	if payload.Role != "authenticated" {
		t.Errorf("expected role=authenticated, got %s", payload.Role)
	}
}

func TestVerify_ExpiredToken(t *testing.T) {
	v := NewJWTVerifier(testSecret)

	tokenStr := createToken(t, testSecret, JWTPayload{
		Sub: "user-123",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
		},
	})

	_, err := v.Verify(tokenStr)
	if err == nil {
		t.Fatal("expected error for expired token, got nil")
	}
}

func TestVerify_InvalidSignature(t *testing.T) {
	v := NewJWTVerifier(testSecret)

	tokenStr := createToken(t, "wrong-secret", JWTPayload{
		Sub: "user-123",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	})

	_, err := v.Verify(tokenStr)
	if err == nil {
		t.Fatal("expected error for invalid signature, got nil")
	}
}

func TestVerify_MalformedToken(t *testing.T) {
	v := NewJWTVerifier(testSecret)

	malformed := []string{
		"",
		"not-a-jwt",
		"a.b.c",
		"eyJhbGciOiJIUzI1NiJ9.invalid.signature",
	}

	for _, tok := range malformed {
		_, err := v.Verify(tok)
		if err == nil {
			t.Errorf("expected error for malformed token %q, got nil", tok)
		}
	}
}
