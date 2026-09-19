const ADMIN_DOMAINS = ['globalxcelerate.com'];

export function isAdminEligible(email: string): boolean {
  if (!email) return false;

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;

  // Check against whitelisted domains
  if (ADMIN_DOMAINS.includes(domain)) {
    return true;
  }

  // TODO: Query admin_email_whitelist table for specific email addresses
  // const { data } = await supabase
  //   .from('admin_email_whitelist')
  //   .select('id')
  //   .eq('email', email.toLowerCase())
  //   .eq('is_active', true)
  //   .single();
  // return !!data;

  return false;
}
