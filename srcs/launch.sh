su -c "pg_ctl start -D /var/lib/postgresql/data" - postgres
/usr/sbin/lighttpd -f /etc/lighttpd/lighttpd.conf
/usr/bin/rails db:migrate
/usr/bin/rails s -b '0.0.0.0' -p 80