"""
Fix settings page:
1. Remove MfaSection from ProfileTab (lines 112-118)
2. Fix SecurityTab - remove extra <div> wrapper (line 131), fix return
3. Add MfaSection + closing div to SecurityTab properly
"""

with open('src/app/settings/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Remove the misplaced MFA stuff from ProfileTab (after </form> before SecurityTab comment)
# Target: in ProfileTab, remove the extra divider + MfaSection + </div>
wrong_mfa_block = '\n\n        {/* Divider */}\n        <div className="border-t border-slate-100 dark:border-slate-700" />\n\n        {/* MFA Authenticator */}\n        <MfaSection />\n        </div>'
correct_profile_end = ''

if wrong_mfa_block in content:
    content = content.replace(wrong_mfa_block, correct_profile_end, 1)
    print("Fix 1 done: removed MFA from ProfileTab")
else:
    # Try CRLF
    wrong_mfa_block2 = '\r\n\r\n        {/* Divider */}\r\n        <div className="border-t border-slate-100 dark:border-slate-700" />\r\n\r\n        {/* MFA Authenticator */}\r\n        <MfaSection />\r\n        </div>'
    if wrong_mfa_block2 in content:
        content = content.replace(wrong_mfa_block2, correct_profile_end, 1)
        print("Fix 1 done (CRLF): removed MFA from ProfileTab")
    else:
        print("Fix 1 FAILED - block not found")

# Fix 2: Remove the extra <div> from SecurityTab opening
wrong_security_wrap = '        <div className="space-y-8 max-w-xl">\n        <form action={formAction} className="space-y-6">'
correct_security_return = '        <form action={formAction} className="space-y-6 max-w-xl">'

if wrong_security_wrap in content:
    content = content.replace(wrong_security_wrap, correct_security_return, 1)
    print("Fix 2 done: removed extra div from SecurityTab")
else:
    print("Fix 2 FAILED - security wrap not found")

# Fix 3: Add MfaSection to SecurityTab - after </form> before AppearanceTab comment
old_security_end = '        </form>\n    );\n}\n\n// ─── Appearance Tab'
new_security_end = '''        </form>

        {/* Divider */}
        <div className="border-t border-slate-100 dark:border-slate-700" />

        {/* MFA Authenticator */}
        <MfaSection />
        </div>
    );
}

// ─── Appearance Tab'''

if old_security_end in content:
    content = content.replace(old_security_end, new_security_end, 1)
    print("Fix 3 done: added MFA to SecurityTab")
else:
    # Try CRLF
    old2 = '        </form>\r\n    );\r\n}\r\n\r\n// \u2500\u2500\u2500 Appearance Tab'
    if old2 in content:
        content = content.replace(old2, new_security_end, 1)
        print("Fix 3 done (CRLF)")
    else:
        idx = content.find('// \u2500\u2500\u2500 Appearance Tab')
        print(f"Fix 3 FAILED. Context before: {repr(content[idx-60:idx])}")

with open('src/app/settings/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
