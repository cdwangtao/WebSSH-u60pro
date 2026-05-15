//go:build !windows
// +build !windows

package service

import (
	"fmt"
	"gossh/crypto/ssh"
	"gossh/pty"
	"os"
	"syscall"
	"unsafe"
)

func signalPtyForeground(shellPty pty.Pty, proc *os.Process, sig ssh.Signal) error {
	sysSig, err := toSysSignal(sig)
	if err != nil {
		return err
	}

	var pgrp int
	_, _, errno := syscall.Syscall(
		syscall.SYS_IOCTL,
		shellPty.Fd(),
		uintptr(syscall.TIOCGPGRP),
		uintptr(unsafe.Pointer(&pgrp)),
	)
	if errno == 0 && pgrp > 0 {
		return syscall.Kill(-pgrp, sysSig)
	}

	if proc == nil {
		if errno != 0 {
			return errno
		}
		return fmt.Errorf("pty foreground process group not found")
	}
	return syscall.Kill(-proc.Pid, sysSig)
}

func toSysSignal(sig ssh.Signal) (syscall.Signal, error) {
	switch sig {
	case ssh.SIGINT:
		return syscall.SIGINT, nil
	default:
		return 0, fmt.Errorf("unsupported signal %s", sig)
	}
}
