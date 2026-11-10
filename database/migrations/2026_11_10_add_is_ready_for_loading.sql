-- Yükləməyə hazır seçiminin elanla birlikdə saxlanması
-- Mövcud qeydlər üçün 0: köhnə elanların hazır statusu məlum deyil.
ALTER TABLE loads
    ADD COLUMN is_ready_for_loading TINYINT(1) NOT NULL DEFAULT 0
    AFTER pickup_from;
