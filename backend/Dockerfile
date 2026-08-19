FROM php:8.1-cli

RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev \
    libxml2-dev zip unzip libzip-dev

RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip opcache

RUN pecl install redis && docker-php-ext-enable redis

# Opcache — drastično ubrzava PHP (kešira kompajlirane fajlove u memoriji).
# validate_timestamps=1 + revalidate_freq=0 → izmjene koda se i dalje vide odmah (dev mod).
RUN { \
    echo "opcache.enable=1"; \
    echo "opcache.enable_cli=1"; \
    echo "opcache.memory_consumption=256"; \
    echo "opcache.max_accelerated_files=20000"; \
    echo "opcache.validate_timestamps=1"; \
    echo "opcache.revalidate_freq=0"; \
    echo "realpath_cache_size=4096K"; \
    echo "realpath_cache_ttl=600"; \
} > /usr/local/etc/php/conf.d/opcache.ini

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]