<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250826145743 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE cryptocurrency_price_history (id SERIAL NOT NULL, cryptocurrency_id INT NOT NULL, game_id INT DEFAULT NULL, price NUMERIC(10, 2) NOT NULL, recorded_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, turn_number INT DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_4F6C32F1583FC03A ON cryptocurrency_price_history (cryptocurrency_id)');
        $this->addSql('CREATE INDEX IDX_4F6C32F1E48FD905 ON cryptocurrency_price_history (game_id)');
        $this->addSql('ALTER TABLE cryptocurrency_price_history ADD CONSTRAINT FK_4F6C32F1583FC03A FOREIGN KEY (cryptocurrency_id) REFERENCES cryptocurrency (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE cryptocurrency_price_history ADD CONSTRAINT FK_4F6C32F1E48FD905 FOREIGN KEY (game_id) REFERENCES game (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE cryptocurrency_price_history DROP CONSTRAINT FK_4F6C32F1583FC03A');
        $this->addSql('ALTER TABLE cryptocurrency_price_history DROP CONSTRAINT FK_4F6C32F1E48FD905');
        $this->addSql('DROP TABLE cryptocurrency_price_history');
    }
}
