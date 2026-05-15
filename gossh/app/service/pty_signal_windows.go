//go:build windows
// +build windows

package service

import (
	"fmt"
	"gossh/crypto/ssh"
	"gossh/pty"
	"os"
)

func signalPtyForeground(shellPty pty.Pty, proc *os.Process, sig ssh.Signal) error {
	if proc == nil {
		return fmt.Errorf("shell process not found")
	}
	switch sig {
	case ssh.SIGINT:
		return proc.Signal(os.Interrupt)
	default:
		return fmt.Errorf("unsupported signal %s", sig)
	}
}
